
import { ReactNode, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { 
  Calendar, 
  Users, 
  User, 
  Award, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Home,
  WifiOff
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { currentUser, logout, hasRole, isOffline } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.getElementById('mobile-sidebar');
      const toggleButton = document.getElementById('sidebar-toggle');
      
      if (sidebar && 
          !sidebar.contains(event.target as Node) && 
          toggleButton && 
          !toggleButton.contains(event.target as Node)) {
        setSidebarOpen(false);
      }
    };

    if (sidebarOpen && isMobile) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [sidebarOpen, isMobile]);

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="rounded-full"
          id="sidebar-toggle"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Sidebar */}
      <div
        id="mobile-sidebar"
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-[280px] transform transition-transform duration-200 ease-in-out lg:translate-x-0 bg-white dark:bg-gray-900 shadow-lg",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Close button (mobile only) */}
          <div className="lg:hidden absolute top-4 right-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={closeSidebar}
              className="h-8 w-8"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Logo and app name */}
          <div className="flex items-center gap-2 px-5 py-5 border-b">
            <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-netball-400 rounded-full">
              <Award className="h-6 w-6 md:h-7 md:w-7 text-white" />
            </div>
            <span className="text-xl md:text-2xl font-bold">Netball Club</span>
          </div>

          {/* User info */}
          {currentUser && (
            <div className="border-b p-5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                  {currentUser.profileImage ? (
                    <img
                      src={currentUser.profileImage}
                      alt={currentUser.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="h-6 w-6 text-gray-500" />
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-base md:text-lg truncate">{currentUser.name}</span>
                  <span className="text-sm md:text-base text-gray-500">
                    {currentUser.roles.map((role) => 
                      role.charAt(0).toUpperCase() + role.slice(1)
                    ).join(", ")}
                  </span>
                </div>
              </div>
              
              {/* Offline indicator */}
              {isOffline && (
                <div className="flex items-center mt-3 p-2 bg-amber-50 rounded text-amber-700 gap-2">
                  <WifiOff className="h-4 w-4" />
                  <span className="text-sm">Offline Mode</span>
                </div>
              )}
            </div>
          )}

          {/* Navigation links */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="flex items-center gap-3 rounded-md px-4 py-3 text-base text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={closeSidebar}
                >
                  <Home className="h-5 w-5" />
                  <span>Dashboard</span>
                </Link>
              </li>

              {hasRole("parent") && (
                <li>
                  <Link
                    to="/children"
                    className="flex items-center gap-3 rounded-md px-4 py-3 text-base text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                    onClick={closeSidebar}
                  >
                    <Users className="h-5 w-5" />
                    <span>My Children</span>
                  </Link>
                </li>
              )}

              <li>
                <Link
                  to="/teams"
                  className="flex items-center gap-3 rounded-md px-4 py-3 text-base text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={closeSidebar}
                >
                  <Award className="h-5 w-5" />
                  <span>Teams</span>
                </Link>
              </li>

              <li>
                <Link
                  to="/events"
                  className="flex items-center gap-3 rounded-md px-4 py-3 text-base text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={closeSidebar}
                >
                  <Calendar className="h-5 w-5" />
                  <span>Events</span>
                </Link>
              </li>

              {(hasRole("coach") || hasRole("manager") || hasRole("admin")) && (
                <li>
                  <Link
                    to="/approvals"
                    className="flex items-center gap-3 rounded-md px-4 py-3 text-base text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                    onClick={closeSidebar}
                  >
                    <User className="h-5 w-5" />
                    <span>Approvals</span>
                  </Link>
                </li>
              )}

              {hasRole("admin") && (
                <li>
                  <Link
                    to="/settings"
                    className="flex items-center gap-3 rounded-md px-4 py-3 text-base text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                    onClick={closeSidebar}
                  >
                    <Settings className="h-5 w-5" />
                    <span>Settings</span>
                  </Link>
                </li>
              )}
            </ul>
          </nav>

          {/* Logout button */}
          {currentUser && (
            <div className="border-t p-4">
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 text-base text-gray-700 hover:bg-gray-100 hover:text-gray-900 py-3 h-auto dark:hover:bg-gray-800"
                onClick={() => {
                  handleLogout();
                  closeSidebar();
                }}
              >
                <LogOut className="h-5 w-5" />
                <span>Log out</span>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 lg:pl-[280px] w-full">
        <main className="min-h-screen p-5 sm:p-6 md:p-8 w-full max-w-[1920px] mx-auto">
          {children}
        </main>
      </div>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default Layout;
