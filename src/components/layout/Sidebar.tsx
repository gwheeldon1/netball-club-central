import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { 
  Home, 
  Users, 
  User, 
  Award, 
  Settings, 
  LogOut, 
  X, 
  Calendar 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const { currentUser, logout, hasRole } = useAuth();

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
  };

  return (
    <div 
      id="mobile-sidebar" 
      className={cn(
        "fixed inset-y-0 left-0 z-40 w-[280px] transform transition-transform duration-200 ease-in-out lg:translate-x-0 bg-background shadow-lg border-r border-border",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div className="flex h-full flex-col">
        {/* Close button (mobile/tablet only) */}
        <div className="lg:hidden absolute top-4 right-4 z-10">
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Logo and app name */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-border">
          <img 
            src="/shot-tracker-main-logo.png" 
            alt="Club Manager Logo" 
            className="w-10 h-10"
          />
          <span className="text-xl font-bold">Club Manager</span>
        </div>

        {/* User info */}
        {currentUser && (
          <div className="border-b border-border p-6">
            <Link 
              to="/profile" 
              className="flex items-center gap-3 hover:bg-muted/50 rounded-lg p-2 transition-colors" 
              onClick={onClose}
            >
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                <User className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-medium text-sm truncate">{currentUser.email}</span>
                <span className="text-xs text-muted-foreground">User</span>
              </div>
            </Link>
          </div>
        )}

        {/* Navigation links */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1">
            <li>
              <Link 
                to="/" 
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors" 
                onClick={onClose}
              >
                <Home className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
            </li>

            {hasRole("parent") && (
              <li>
                <Link 
                  to="/children" 
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors" 
                  onClick={onClose}
                >
                  <Users className="h-4 w-4" />
                  <span>My Children</span>
                </Link>
              </li>
            )}

            <li>
              <Link 
                to="/teams" 
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors" 
                onClick={onClose}
              >
                <Award className="h-4 w-4" />
                <span>Teams</span>
              </Link>
            </li>

            <li>
              <Link 
                to="/events" 
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors" 
                onClick={onClose}
              >
                <Calendar className="h-4 w-4" />
                <span>Events</span>
              </Link>
            </li>

            {(hasRole("coach") || hasRole("manager") || hasRole("admin")) && (
              <li>
                <Link 
                  to="/approvals" 
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors" 
                  onClick={onClose}
                >
                  <User className="h-4 w-4" />
                  <span>Approvals</span>
                </Link>
              </li>
            )}

            {hasRole("admin") && (
              <li>
                <Link 
                  to="/settings" 
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors" 
                  onClick={onClose}
                >
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </li>
            )}
          </ul>
        </nav>

        {/* Logout button */}
        {currentUser && (
          <div className="border-t border-border p-4">
            <Button 
              variant="ghost" 
              className="w-full justify-start gap-3 text-sm font-medium text-foreground hover:bg-muted transition-colors py-2.5 h-auto" 
              onClick={() => {
                handleLogout();
                onClose();
              }}
            >
              <LogOut className="h-4 w-4" />
              <span>Log out</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};