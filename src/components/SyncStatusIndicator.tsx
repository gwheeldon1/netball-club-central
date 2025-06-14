import { Cloud, CloudOff, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { useOffline } from '@/hooks/use-offline';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export const SyncStatusIndicator = () => {
  const { isOnline, isSyncing, forceSync } = useOffline();

  return (
    <Card className="w-fit">
      <CardContent className="flex items-center gap-2 p-3">
        {isOnline ? (
          <Wifi className="h-4 w-4 text-primary" />
        ) : (
          <WifiOff className="h-4 w-4 text-muted-foreground" />
        )}
        
        <span className="text-sm font-medium">
          {isOnline ? 'Online' : 'Offline'}
        </span>
        
        {isSyncing ? (
          <div className="flex items-center gap-1">
            <RefreshCw className="h-4 w-4 animate-spin text-primary" />
            <span className="text-xs text-muted-foreground">Syncing...</span>
          </div>
        ) : isOnline ? (
          <div className="flex items-center gap-1">
            <Cloud className="h-4 w-4 text-primary" />
            <span className="text-xs text-muted-foreground">Synced</span>
          </div>
        ) : (
          <div className="flex items-center gap-1">
            <CloudOff className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Local only</span>
          </div>
        )}
        
        {isOnline && !isSyncing && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={forceSync}
            className="h-6 px-2"
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
};