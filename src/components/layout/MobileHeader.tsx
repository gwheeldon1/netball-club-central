import { Button } from "@/components/ui/button";
import { Menu, Bell } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface MobileHeaderProps {
  onToggleSidebar: () => void;
}

export const MobileHeader = ({ onToggleSidebar }: MobileHeaderProps) => {
  const { hasRole } = useAuth();

  return (
    <div id="mobile-header" className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border lg:hidden">
      <div className="flex items-center justify-between px-4 py-3">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onToggleSidebar} 
          id="sidebar-toggle" 
          className="h-11 w-11"
        >
          <Menu className="h-9 w-9" />
        </Button>
        
        <div className="flex items-center gap-2">
          <img 
            src="/shot-tracker-main-logo.png" 
            alt="Club Manager Logo" 
            className="w-8 h-8"
          />
          <span className="text-lg font-semibold">Club Manager</span>
        </div>
        
        <div className="flex items-center gap-2">
          {(hasRole("admin") || hasRole("coach") || hasRole("manager")) && (
            <Button variant="ghost" size="icon" className="h-9 w-9" asChild>
              <Link to="/approvals">
                <Bell className="h-8 w-8" />
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};