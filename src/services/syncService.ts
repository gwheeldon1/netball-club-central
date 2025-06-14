import { offlineApi, SyncStatus } from './database';
// Sync service functionality needs to be refactored to use unified API
import { DBUser, DBChild, DBTeam, DBEvent, DBAttendance } from '@/types/database';
import { User, Child, Team, Event, Attendance, UserRole } from '@/types';
import { logger } from '@/utils/logger';

export class SyncService {
  private isOnline = navigator.onLine;
  private syncInProgress = false;
  private maxRetries = 3;
  private retryDelay = 1000; // 1 second

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
    logger.info('Starting sync to Supabase...');

    try {
      const pendingItems = await offlineApi.getPendingSyncItems();
      
      for (const item of pendingItems) {
        try {
          await this.syncItemWithRetry(item);
          await offlineApi.markSyncComplete(item.id);
        } catch (error) {
          logger.error(`Failed to sync item ${item.id} after ${this.maxRetries} attempts:`, error);
          // Continue with other items
        }
      }

      // Clean up completed sync items
      await offlineApi.clearSyncQueue();
      logger.info('Sync completed successfully');
    } catch (error) {
      logger.error('Sync failed:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  private async syncItemWithRetry(item: SyncStatus): Promise<void> {
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        await this.syncItem(item);
        return; // Success
      } catch (error) {
        logger.error(`Sync attempt ${attempt} failed for item ${item.id}:`, error);
        
        if (attempt === this.maxRetries) {
          throw error; // Final attempt failed
        }
        
        // Wait before retry with exponential backoff
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt));
      }
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
        logger.debug('Events sync not implemented yet');
        break;
      case 'attendance':
        logger.debug('Attendance sync not implemented yet');
        break;
      default:
        logger.warn(`Unknown table for sync: ${item.tableName}`);
    }
  }

  private async syncUser(item: SyncStatus): Promise<void> {
    // Sync functionality temporarily disabled - needs unified API implementation
    logger.info('User sync not implemented with unified API yet');
  }

  private async syncChild(item: SyncStatus): Promise<void> {
    // Sync functionality temporarily disabled - needs unified API implementation
    logger.info('Child sync not implemented with unified API yet');
  }

  private async syncTeam(item: SyncStatus): Promise<void> {
    // Sync functionality temporarily disabled - needs unified API implementation
    logger.info('Team sync not implemented with unified API yet');
  }

  async syncFromSupabase(): Promise<void> {
    if (!this.isOnline) return;

    logger.info('Sync from Supabase temporarily disabled - needs unified API implementation');
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