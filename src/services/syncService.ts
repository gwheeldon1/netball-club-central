import { offlineApi, SyncStatus } from './database';
import { supabaseChildrenApi, supabaseTeamApi, supabaseUserApi } from './supabaseApi';
import { DBUser, DBChild, DBTeam, DBEvent, DBAttendance } from '@/types/database';
import { User, Child, Team, Event, Attendance, UserRole } from '@/types';

export class SyncService {
  private isOnline = navigator.onLine;
  private syncInProgress = false;

  constructor() {
    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncToSupabase();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    // Auto-sync every 30 seconds when online
    setInterval(() => {
      if (this.isOnline && !this.syncInProgress) {
        this.syncToSupabase();
      }
    }, 30000);
  }

  // Convert between DB types and API types
  private convertDBUserToUser(dbUser: DBUser): User {
    return {
      ...dbUser,
      roles: dbUser.roles as UserRole[]
    };
  }

  private convertUserToDBUser(user: User): DBUser {
    return {
      ...user,
      roles: user.roles as string[]
    };
  }

  private convertDBChildToChild(dbChild: DBChild): Child {
    return dbChild as Child;
  }

  private convertChildToDBChild(child: Child): DBChild {
    return child as DBChild;
  }

  private convertDBTeamToTeam(dbTeam: DBTeam): Team {
    return dbTeam as Team;
  }

  private convertTeamToDBTeam(team: Team): DBTeam {
    return {
      id: team.id,
      name: team.name,
      ageGroup: team.ageGroup,
      category: team.category,
      profileImage: team.profileImage,
      bannerImage: team.bannerImage,
      icon: team.icon,
      description: team.description
    };
  }

  async syncToSupabase(): Promise<void> {
    if (!this.isOnline || this.syncInProgress) return;

    this.syncInProgress = true;
    console.log('Starting sync to Supabase...');

    try {
      const pendingItems = await offlineApi.getPendingSyncItems();
      
      for (const item of pendingItems) {
        try {
          await this.syncItem(item);
          await offlineApi.markSyncComplete(item.id);
        } catch (error) {
          console.error(`Failed to sync item ${item.id}:`, error);
          // Continue with other items
        }
      }

      // Clean up completed sync items
      await offlineApi.clearSyncQueue();
      console.log('Sync completed successfully');
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  private async syncItem(item: SyncStatus): Promise<void> {
    switch (item.tableName) {
      case 'users':
        await this.syncUser(item);
        break;
      case 'children':
        await this.syncChild(item);
        break;
      case 'teams':
        await this.syncTeam(item);
        break;
      case 'events':
        // Events API not implemented yet
        console.log('Events sync not implemented yet');
        break;
      case 'attendance':
        // Attendance API not implemented yet
        console.log('Attendance sync not implemented yet');
        break;
      default:
        console.warn(`Unknown table for sync: ${item.tableName}`);
    }
  }

  private async syncUser(item: SyncStatus): Promise<void> {
    switch (item.action) {
      case 'create':
        // Create new user in Supabase
        if (item.data) {
          const user = this.convertDBUserToUser(item.data);
          // Note: User creation in Supabase might need different handling
          console.log('User creation sync not fully implemented');
        }
        break;
      case 'update':
        // Update user in Supabase
        if (item.data) {
          console.log('User update sync not fully implemented');
        }
        break;
      case 'delete':
        // Delete user in Supabase
        console.log('User deletion sync not fully implemented');
        break;
    }
  }

  private async syncChild(item: SyncStatus): Promise<void> {
    switch (item.action) {
      case 'create':
        if (item.data) {
          const child = this.convertDBChildToChild(item.data);
          await supabaseChildrenApi.create(child);
        }
        break;
      case 'update':
        if (item.data) {
          await supabaseChildrenApi.update(item.recordId, item.data);
        }
        break;
      case 'delete':
        // Child deletion not implemented in Supabase API yet
        console.log('Child deletion sync not implemented yet');
        break;
    }
  }

  private async syncTeam(item: SyncStatus): Promise<void> {
    switch (item.action) {
      case 'create':
        if (item.data) {
          const team = this.convertDBTeamToTeam(item.data);
          await supabaseTeamApi.create(team);
        }
        break;
      case 'update':
        // Team update not implemented in Supabase API yet
        console.log('Team update sync not implemented yet');
        break;
      case 'delete':
        // Team deletion not implemented in Supabase API yet
        console.log('Team deletion sync not implemented yet');
        break;
    }
  }

  async syncFromSupabase(): Promise<void> {
    if (!this.isOnline) return;

    console.log('Starting sync from Supabase...');

    try {
      // Sync users
      const users = await supabaseUserApi.getAll();
      for (const user of users) {
        const dbUser = this.convertUserToDBUser(user);
        // Check if user exists locally
        const existingUser = await offlineApi.getUserById(user.id);
        if (!existingUser) {
          // Add to local database without triggering sync
          await offlineApi.createUser({ ...user, id: undefined } as any);
        }
      }

      // Sync children
      const children = await supabaseChildrenApi.getAll();
      for (const child of children) {
        const existingChild = await offlineApi.getChildById(child.id);
        if (!existingChild) {
          await offlineApi.createChild({ ...child, id: undefined } as any);
        }
      }

      // Sync teams
      const teams = await supabaseTeamApi.getAll();
      for (const team of teams) {
        const existingTeam = await offlineApi.getTeamById(team.id);
        if (!existingTeam) {
          await offlineApi.createTeam({ ...team, id: undefined } as any);
        }
      }

      console.log('Sync from Supabase completed');
    } catch (error) {
      console.error('Failed to sync from Supabase:', error);
    }
  }

  // Manual sync trigger
  async forceSync(): Promise<void> {
    await this.syncToSupabase();
    await this.syncFromSupabase();
  }

  getOnlineStatus(): boolean {
    return this.isOnline;
  }

  getSyncStatus(): boolean {
    return this.syncInProgress;
  }
}

export const syncService = new SyncService();