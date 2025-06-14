import { useCallback, useState } from 'react';
import { logger } from '@/utils/logger';
import { toast } from 'sonner';

interface SyncConflict {
  id: string;
  localData: any;
  remoteData: any;
  conflictType: 'version' | 'delete' | 'duplicate';
}

interface ConflictResolutionStrategy {
  strategy: 'local_wins' | 'remote_wins' | 'merge' | 'manual';
  resolver?: (local: any, remote: any) => any;
}

export function useConflictResolution() {
  const [conflicts, setConflicts] = useState<SyncConflict[]>([]);
  const [isResolving, setIsResolving] = useState(false);

  const detectConflict = useCallback((localItem: any, remoteItem: any): SyncConflict | null => {
    // Version conflict - both items updated since last sync
    if (localItem.updated_at && remoteItem.updated_at) {
      const localTime = new Date(localItem.updated_at).getTime();
      const remoteTime = new Date(remoteItem.updated_at).getTime();
      
      if (Math.abs(localTime - remoteTime) > 1000) { // More than 1 second apart
        return {
          id: localItem.id,
          localData: localItem,
          remoteData: remoteItem,
          conflictType: 'version'
        };
      }
    }

    // Delete conflict - item deleted locally but updated remotely
    if (localItem.deleted && remoteItem.updated_at) {
      return {
        id: localItem.id,
        localData: localItem,
        remoteData: remoteItem,
        conflictType: 'delete'
      };
    }

    return null;
  }, []);

  const resolveConflict = useCallback(async (
    conflict: SyncConflict,
    strategy: ConflictResolutionStrategy
  ): Promise<any> => {
    setIsResolving(true);

    try {
      switch (strategy.strategy) {
        case 'local_wins':
          logger.info(`Conflict resolved: Local wins for ${conflict.id}`);
          return conflict.localData;

        case 'remote_wins':
          logger.info(`Conflict resolved: Remote wins for ${conflict.id}`);
          return conflict.remoteData;

        case 'merge':
          if (strategy.resolver) {
            const merged = strategy.resolver(conflict.localData, conflict.remoteData);
            logger.info(`Conflict resolved: Merged for ${conflict.id}`);
            return merged;
          }
          // Fallback to simple merge
          return {
            ...conflict.remoteData,
            ...conflict.localData,
            updated_at: new Date().toISOString(),
            conflict_resolved: true
          };

        case 'manual':
          // Add to conflicts list for manual resolution
          setConflicts(prev => [...prev, conflict]);
          toast.error(`Sync conflict detected for item ${conflict.id}. Manual resolution required.`);
          return null;

        default:
          throw new Error(`Unknown resolution strategy: ${strategy.strategy}`);
      }
    } catch (error) {
      logger.error('Error resolving conflict:', error);
      throw error;
    } finally {
      setIsResolving(false);
    }
  }, []);

  const createMergeStrategy = useCallback((mergeFields: string[]): ConflictResolutionStrategy => {
    return {
      strategy: 'merge',
      resolver: (local: any, remote: any) => {
        const merged = { ...remote };
        
        // Merge specific fields from local
        mergeFields.forEach(field => {
          if (local[field] !== undefined) {
            merged[field] = local[field];
          }
        });

        // Always use the latest timestamp
        merged.updated_at = new Date().toISOString();
        merged.conflict_resolved = true;
        
        return merged;
      }
    };
  }, []);

  const resolveConflictManually = useCallback((conflictId: string, resolution: any) => {
    setConflicts(prev => prev.filter(c => c.id !== conflictId));
    logger.info(`Manual conflict resolution applied for ${conflictId}`);
    return resolution;
  }, []);

  const clearResolvedConflicts = useCallback(() => {
    setConflicts([]);
  }, []);

  return {
    conflicts,
    isResolving,
    detectConflict,
    resolveConflict,
    createMergeStrategy,
    resolveConflictManually,
    clearResolvedConflicts
  };
}