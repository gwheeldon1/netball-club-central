
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
  Calendar,
  BarChart3
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
        "fixed inset-y-0 left-0 z-40 w-[280px] transform transition-all duration-300 ease-in-out lg:translate-x-0 glass-card border-r border-border",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div className="flex h-full flex-col">
        {/* Close button (mobile/tablet only) */}
        <div className="lg:hidden absolute top-4 right-4 z-10">
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 hover:bg-accent/50">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Enhanced logo and app name */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-border/50">
          <div className="w-10 h-10 rounded-xl gradient-primary shadow-glow flex items-center justify-center">
            <img 
              src="/shot-tracker-main-logo.png" 
              alt="Club Manager Logo" 
              className="w-6 h-6"
            />
          </div>
          <span className="text-xl font-bold text-gradient">Club Manager</span>
        </div>

        {/* Enhanced user info */}
        {currentUser && (
          <div className="border-b border-border/50 p-6">
            <Link 
              to="/profile" 
              className="flex items-center gap-3 hover:bg-accent/50 rounded-xl p-3 transition-all duration-200 card-hover" 
              onClick={onClose}
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center overflow-hidden shadow-glow">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-medium text-sm truncate">{currentUser.email}</span>
                <span className="text-xs text-muted-foreground">Club Member</span>
              </div>
            </Link>
          </div>
        )}

        {/* Enhanced navigation links */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-2">
            <li>
              <Link 
                to="/" 
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-foreground hover:bg-accent/50 transition-all duration-200 card-hover" 
                onClick={onClose}
              >
                <Home className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
            </li>

            <li>
              <Link 
                to="/analytics" 
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-foreground hover:bg-accent/50 transition-all duration-200 card-hover" 
                onClick={onClose}
              >
                <BarChart3 className="h-4 w-4" />
                <span>Analytics</span>
              </Link>
            </li>

            {hasRole("parent") && (
              <li>
                <Link 
                  to="/children" 
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-foreground hover:bg-accent/50 transition-all duration-200 card-hover" 
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
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-foreground hover:bg-accent/50 transition-all duration-200 card-hover" 
                onClick={onClose}
              >
                <Award className="h-4 w-4" />
                <span>Teams</span>
              </Link>
            </li>

            <li>
              <Link 
                to="/events" 
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-foreground hover:bg-accent/50 transition-all duration-200 card-hover" 
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
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-foreground hover:bg-accent/50 transition-all duration-200 card-hover" 
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
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-foreground hover:bg-accent/50 transition-all duration-200 card-hover" 
                  onClick={onClose}
                >
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </li>
            )}
          </ul>
        </nav>

        {/* Enhanced logout button */}
        {currentUser && (
          <div className="border-t border-border/50 p-4">
            <Button 
              variant="ghost" 
              className="w-full justify-start gap-3 text-sm font-medium text-foreground hover:bg-accent/50 transition-all duration-200 py-3 h-auto rounded-xl" 
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
