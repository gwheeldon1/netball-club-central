import { useState, useEffect } from 'react';
import { syncService } from '@/services/syncService';
import { logger } from '@/utils/logger';

export function useOffline() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    // Check sync status periodically
    const checkSyncStatus = () => {
      setIsSyncing(syncService.getSyncStatus());
    };

    const interval = setInterval(checkSyncStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  const forceSync = async () => {
    try {
      await syncService.forceSync();
    } catch (error) {
      logger.error('Force sync failed:', error);
    }
  };

  return {
    isOnline,
    isSyncing,
    forceSync
  };
}