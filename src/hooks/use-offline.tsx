
import { useState, useEffect } from 'react';
import { toast } from "sonner";

interface UseOfflineOptions {
  showToasts?: boolean;
}

export function useOffline(options: UseOfflineOptions = {}) {
  const { showToasts = false } = options;
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
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

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [showToasts]);

  return isOffline;
}
