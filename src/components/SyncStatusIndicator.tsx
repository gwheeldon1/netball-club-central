import { useState, useEffect } from 'react';
import { useOffline } from '@/hooks/use-offline';
import { syncService } from '@/services/syncService';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RotateCw, Wifi, WifiOff } from 'lucide-react';

export function SyncStatusIndicator() {
  const { isOffline } = useOffline();
  const [syncStatus, setSyncStatus] = useState<{
    isOnline: boolean;
    lastSync: Date | null;
    pendingChanges: number;
  }>({ isOnline: true, lastSync: null, pendingChanges: 0 });

  useEffect(() => {
    const updateSyncStatus = async () => {
      const status = await syncService.getSyncStatus();
      setSyncStatus(status);
    };

    updateSyncStatus();
    const interval = setInterval(updateSyncStatus, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [isOffline]);

  const handleManualSync = async () => {
    await syncService.manualSync();
    const status = await syncService.getSyncStatus();
    setSyncStatus(status);
  };

  return (
    <div className="flex items-center gap-2">
      {isOffline ? (
        <Badge variant="destructive" className="flex items-center gap-1">
          <WifiOff size={12} />
          Offline
        </Badge>
      ) : (
        <Badge variant="outline" className="flex items-center gap-1">
          <Wifi size={12} />
          Online
        </Badge>
      )}
      
      {syncStatus.pendingChanges > 0 && (
        <Badge variant="secondary">
          {syncStatus.pendingChanges} pending
        </Badge>
      )}
      
      <Button
        variant="ghost"
        size="sm"
        onClick={handleManualSync}
        disabled={isOffline}
        className="h-8 px-2"
      >
        <Sync size={14} />
      </Button>
    </div>
  );
}