
import { useOffline } from "@/hooks/use-offline";
import { useState, useEffect } from "react";
import { WifiOff } from "lucide-react";

export function NetworkStatus() {
  const isOffline = useOffline();
  const [visible, setVisible] = useState(false);
  
  // Show indicator when offline, hide after a delay when back online
  useEffect(() => {
    if (isOffline) {
      setVisible(true);
    } else {
      // When coming back online, show the indicator for 3 seconds before hiding
      const timer = setTimeout(() => {
        setVisible(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isOffline]);
  
  if (!visible) return null;
  
  return (
    <div 
      className={`fixed bottom-4 left-4 z-50 flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-full shadow-lg transition-all duration-300 ${
        isOffline 
          ? "bg-red-600 text-white" 
          : "bg-green-500 text-white"
      }`}
    >
      {isOffline ? (
        <>
          <WifiOff size={16} />
          <span>You are offline</span>
        </>
      ) : (
        <span>Back online</span>
      )}
    </div>
  );
}
