
import { useState, useEffect } from 'react';
import { toast } from "sonner";

interface UseOfflineOptions {
  showToasts?: boolean;
  retryInterval?: number; // in milliseconds
  pingUrl?: string;
}

export function useOffline(options: UseOfflineOptions = {}) {
  const { 
    showToasts = false, 
    retryInterval = 30000, // default to 30 seconds
    pingUrl = 'https://www.google.com/favicon.ico' 
  } = options;
  
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);
  const [lastOnlineTime, setLastOnlineTime] = useState<Date | null>(
    navigator.onLine ? new Date() : null
  );

  // Handle browser online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setLastOnlineTime(new Date());
      if (showToasts) {
        toast.success("You are back online");
      }
    };
    
    const handleOffline = () => {
      setIsOffline(true);
      if (showToasts) {
        toast.warning("You are offline. Some features may be limited.");
      }
    };

    // Set initial state
    setIsOffline(!navigator.onLine);
    if (navigator.onLine) {
      setLastOnlineTime(new Date());
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [showToasts]);

  // Periodically check connection with an active ping
  // This helps detect cases where the browser thinks it's online
  // but there's no actual internet connectivity
  useEffect(() => {
    // Only run active checks when the browser thinks we're online
    if (navigator.onLine) {
      const checkConnection = async () => {
        try {
          // Add a cache-busting parameter
          const response = await fetch(`${pingUrl}?nc=${Date.now()}`, { 
            method: 'HEAD',
            mode: 'no-cors',
            cache: 'no-store',
            timeout: 5000
          } as any);
          
          if (!response) {
            setIsOffline(true);
            if (showToasts) {
              toast.warning("Connection unstable. Some features may be limited.");
            }
          } else if (isOffline) {
            // If we were offline before, but ping succeeded now
            setIsOffline(false);
            setLastOnlineTime(new Date());
            if (showToasts) {
              toast.success("Connection restored");
            }
          }
        } catch (error) {
          setIsOffline(true);
          if (showToasts) {
            toast.warning("Connection lost. Working in offline mode.");
          }
        }
      };

      const intervalId = setInterval(checkConnection, retryInterval);
      
      // Run an immediate check
      checkConnection();
      
      return () => clearInterval(intervalId);
    }
  }, [isOffline, retryInterval, showToasts, pingUrl]);

  return {
    isOffline,
    lastOnlineTime,
    timeOffline: lastOnlineTime ? new Date().getTime() - lastOnlineTime.getTime() : null
  };
}
