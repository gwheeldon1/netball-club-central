// Base API client with offline-first capabilities
import { supabase } from '@/integrations/supabase/client';
import { offlineApi } from '../database';
import { logger } from '@/utils/logger';

export class BaseAPI {
  protected isOnline = navigator.onLine;

  constructor() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      logger.info('API: Back online');
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
      logger.info('API: Gone offline');
    });
  }

  // Health check
  async isConnected(): Promise<boolean> {
    if (!this.isOnline) return false;
    
    try {
      const { error } = await supabase.from('teams').select('id').limit(1);
      return !error;
    } catch {
      return false;
    }
  }

  // Generic method for trying online first, falling back to offline
  protected async withOfflineFallback<T>(
    onlineOperation: () => Promise<T>,
    offlineOperation: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    if (this.isOnline) {
      try {
        const result = await onlineOperation();
        return result;
      } catch (error) {
        logger.warn(`${operationName} failed online, trying offline:`, error);
        return await offlineOperation();
      }
    } else {
      return await offlineOperation();
    }
  }

  getOnlineStatus(): boolean {
    return this.isOnline;
  }

  async getSyncStatus(): Promise<boolean> {
    const pendingItems = await offlineApi.getPendingSyncItems();
    return pendingItems.length === 0;
  }
}