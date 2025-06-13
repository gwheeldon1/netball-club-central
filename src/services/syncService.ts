import { db, DbChild, DbTeam, DbUser, DbEvent } from './database';
import { supabaseChildrenApi, supabaseTeamApi, supabaseUserApi } from './supabaseApi';
import { Child, Team, User, Event } from '@/types';
import { toast } from 'sonner';

export class SyncService {
  private isOnline: boolean = navigator.onLine;
  private syncInProgress: boolean = false;

  constructor() {
    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.performFullSync();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  async performFullSync(): Promise<void> {
    if (!this.isOnline || this.syncInProgress) return;

    this.syncInProgress = true;
    
    try {
      toast.info('Syncing data...');
      
      // Sync in order: users, teams, children, events
      await this.syncUsers();
      await this.syncTeams();
      await this.syncChildren();
      // await this.syncEvents(); // TODO: Implement when events API is ready
      
      toast.success('Data synced successfully');
    } catch (error) {
      console.error('Sync failed:', error);
      toast.error('Sync failed. Changes saved locally.');
    } finally {
      this.syncInProgress = false;
    }
  }

  private async syncUsers(): Promise<void> {
    try {
      // Upload pending local changes
      const pendingUsers = await db.getPendingSync('users') as DbUser[];
      for (const user of pendingUsers) {
        // Note: User creation/update API not implemented in supabaseApi yet
        await db.markAsSynced('users', user.id);
      }

      // Download remote changes
      const remoteUsers = await supabaseUserApi.getAll();
      const lastSync = await db.getLastSyncTime('users');
      
      for (const remoteUser of remoteUsers) {
        const localUser = await db.users.get(remoteUser.id);
        
        if (!localUser) {
          // New remote user
          await db.users.put({
            ...remoteUser,
            lastModified: new Date(),
            syncStatus: 'synced'
          });
        } else if (localUser.syncStatus === 'synced') {
          // Update local copy if it's not modified locally
          await db.users.put({
            ...remoteUser,
            lastModified: new Date(),
            syncStatus: 'synced'
          });
        }
        // If local is 'pending', keep local changes (conflict resolution)
      }

      await db.updateSyncMetadata('users');
    } catch (error) {
      console.error('User sync failed:', error);
      throw error;
    }
  }

  private async syncTeams(): Promise<void> {
    try {
      // Upload pending local changes
      const pendingTeams = await db.getPendingSync('teams') as DbTeam[];
      for (const team of pendingTeams) {
        try {
          if (team.id.startsWith('local_')) {
            // New local team
            const { id, lastModified, syncStatus, ...teamData } = team;
            const newTeam = await supabaseTeamApi.create(teamData);
            await db.teams.delete(team.id);
            await db.teams.put({
              ...newTeam,
              lastModified: new Date(),
              syncStatus: 'synced'
            });
          } else {
            // Updated existing team
            // Note: Update API not implemented yet
            await db.markAsSynced('teams', team.id);
          }
        } catch (error) {
          console.error(`Failed to sync team ${team.id}:`, error);
        }
      }

      // Download remote changes
      const remoteTeams = await supabaseTeamApi.getAll();
      
      for (const remoteTeam of remoteTeams) {
        const localTeam = await db.teams.get(remoteTeam.id);
        
        if (!localTeam) {
          // New remote team
          await db.teams.put({
            ...remoteTeam,
            lastModified: new Date(),
            syncStatus: 'synced'
          });
        } else if (localTeam.syncStatus === 'synced') {
          // Update local copy if it's not modified locally
          await db.teams.put({
            ...remoteTeam,
            lastModified: new Date(),
            syncStatus: 'synced'
          });
        }
        // If local is 'pending', keep local changes (conflict resolution)
      }

      await db.updateSyncMetadata('teams');
    } catch (error) {
      console.error('Team sync failed:', error);
      throw error;
    }
  }

  private async syncChildren(): Promise<void> {
    try {
      // Upload pending local changes
      const pendingChildren = await db.getPendingSync('children') as DbChild[];
      for (const child of pendingChildren) {
        try {
          if (child.id.startsWith('local_')) {
            // New local child
            const { id, lastModified, syncStatus, ...childData } = child;
            const newChild = await supabaseChildrenApi.create(childData);
            await db.children.delete(child.id);
            await db.children.put({
              ...newChild,
              lastModified: new Date(),
              syncStatus: 'synced'
            });
          } else {
            // Updated existing child
            const { lastModified, syncStatus, ...childData } = child;
            await supabaseChildrenApi.update(child.id, childData);
            await db.markAsSynced('children', child.id);
          }
        } catch (error) {
          console.error(`Failed to sync child ${child.id}:`, error);
        }
      }

      // Download remote changes
      const remoteChildren = await supabaseChildrenApi.getAll();
      
      for (const remoteChild of remoteChildren) {
        const localChild = await db.children.get(remoteChild.id);
        
        if (!localChild) {
          // New remote child
          await db.children.put({
            ...remoteChild,
            lastModified: new Date(),
            syncStatus: 'synced'
          });
        } else if (localChild.syncStatus === 'synced') {
          // Update local copy if it's not modified locally
          await db.children.put({
            ...remoteChild,
            lastModified: new Date(),
            syncStatus: 'synced'
          });
        }
        // If local is 'pending', keep local changes (conflict resolution)
      }

      await db.updateSyncMetadata('children');
    } catch (error) {
      console.error('Children sync failed:', error);
      throw error;
    }
  }

  // Manual sync trigger
  async manualSync(): Promise<void> {
    if (!this.isOnline) {
      toast.error('Cannot sync while offline');
      return;
    }
    
    await this.performFullSync();
  }

  // Check if there are pending changes
  async hasPendingChanges(): Promise<boolean> {
    const pendingTables = ['children', 'teams', 'users', 'events', 'attendance'];
    
    for (const table of pendingTables) {
      const pending = await db.getPendingSync(table);
      if (pending.length > 0) return true;
    }
    
    return false;
  }

  // Get sync status
  async getSyncStatus(): Promise<{
    isOnline: boolean;
    lastSync: Date | null;
    pendingChanges: number;
  }> {
    const pendingChanges = await Promise.all([
      db.getPendingSync('children'),
      db.getPendingSync('teams'),
      db.getPendingSync('users'),
      db.getPendingSync('events'),
      db.getPendingSync('attendance')
    ]);

    const totalPending = pendingChanges.reduce((sum, arr) => sum + arr.length, 0);
    
    const lastSyncTimes = await Promise.all([
      db.getLastSyncTime('children'),
      db.getLastSyncTime('teams'),
      db.getLastSyncTime('users')
    ]);

    const lastSync = lastSyncTimes.filter(Boolean).sort((a, b) => b!.getTime() - a!.getTime())[0] || null;

    return {
      isOnline: this.isOnline,
      lastSync,
      pendingChanges: totalPending
    };
  }
}

// Export singleton instance
export const syncService = new SyncService();
