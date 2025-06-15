

import { ReactNode, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Calendar, Users, User, Award, Settings, LogOut, Menu, X, Home, WifiOff, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
interface LayoutProps {
  children: ReactNode;
}
const Layout = ({
  children
}: LayoutProps) => {
  const {
    currentUser,
    logout,
    hasRole
  } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(73); // Default fallback
  const isMobile = useIsMobile();

  // Measure header height dynamically
  useEffect(() => {
    const measureHeaderHeight = () => {
      const header = document.getElementById('mobile-header');
      if (header) {
        const height = header.offsetHeight;
        setHeaderHeight(height);
      }
    };

    // Measure on mount
    measureHeaderHeight();

    // Measure on resize
    window.addEventListener('resize', measureHeaderHeight);
    return () => {
      window.removeEventListener('resize', measureHeaderHeight);
    };
  }, []);

  // Show mobile header on mobile and tablet (up to lg breakpoint)
  const showMobileHeader = true; // We'll control this with CSS classes

  // Close sidebar when clicking outside on mobile/tablet
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.getElementById('mobile-sidebar');
      const toggleButton = document.getElementById('sidebar-toggle');
      if (sidebar && !sidebar.contains(event.target as Node) && toggleButton && !toggleButton.contains(event.target as Node)) {
        setSidebarOpen(false);
      }
    };
    if (sidebarOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [sidebarOpen]);
  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
  };
  const closeSidebar = () => {
    setSidebarOpen(false);
  };
  return <div className="flex min-h-screen bg-background">
      {/* Mobile/Tablet Header - hidden on desktop (lg+) */}
      <div id="mobile-header" className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)} id="sidebar-toggle" className="h-11 w-11">
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
            {(hasRole("admin") || hasRole("coach") || hasRole("manager")) && <Button variant="ghost" size="icon" className="h-9 w-9" asChild>
                <Link to="/approvals">
                  <Bell className="h-8 w-8" />
                </Link>
              </Button>}
            {/* Offline indicator removed */}
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div id="mobile-sidebar" className={cn("fixed inset-y-0 left-0 z-40 w-[280px] transform transition-transform duration-200 ease-in-out lg:translate-x-0 bg-background shadow-lg border-r border-border", sidebarOpen ? "translate-x-0" : "-translate-x-full")}>
        <div className="flex h-full flex-col">
          {/* Close button (mobile/tablet only) */}
          <div className="lg:hidden absolute top-4 right-4 z-10">
            <Button variant="ghost" size="icon" onClick={closeSidebar} className="h-8 w-8">
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
          {currentUser && <div className="border-b border-border p-6">
              <Link to="/profile" className="flex items-center gap-3 hover:bg-muted/50 rounded-lg p-2 transition-colors" onClick={closeSidebar}>
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-medium text-sm truncate">{currentUser.email}</span>
                  <span className="text-xs text-muted-foreground">
                    User
                  </span>
                </div>
              </Link>
              
              {/* Offline indicator removed */}
            </div>}

          {/* Navigation links */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-1">
              <li>
                <Link to="/" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors" onClick={closeSidebar}>
                  <Home className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
              </li>

              {hasRole("parent") && <li>
                  <Link to="/children" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors" onClick={closeSidebar}>
                    <Users className="h-4 w-4" />
                    <span>My Children</span>
                  </Link>
                </li>}

              <li>
                <Link to="/teams" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors" onClick={closeSidebar}>
                  <Award className="h-4 w-4" />
                  <span>Teams</span>
                </Link>
              </li>

              <li>
                <Link to="/events" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors" onClick={closeSidebar}>
                  <Calendar className="h-4 w-4" />
                  <span>Events</span>
                </Link>
              </li>

              {(hasRole("coach") || hasRole("manager") || hasRole("admin")) && <li>
                  <Link to="/approvals" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors" onClick={closeSidebar}>
                    <User className="h-4 w-4" />
                    <span>Approvals</span>
                  </Link>
                </li>}

              {hasRole("admin") && <li>
                  <Link to="/settings" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors" onClick={closeSidebar}>
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </li>}
            </ul>
          </nav>

          {/* Logout button */}
          {currentUser && <div className="border-t border-border p-4">
              <Button variant="ghost" className="w-full justify-start gap-3 text-sm font-medium text-foreground hover:bg-muted transition-colors py-2.5 h-auto" onClick={() => {
            handleLogout();
            closeSidebar();
          }}>
                <LogOut className="h-4 w-4" />
                <span>Log out</span>
              </Button>
            </div>}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 lg:pl-[280px] w-full">
        <main className={cn("min-h-screen w-full max-w-[1920px] mx-auto", "p-4 lg:pt-6 lg:p-8")} style={{
        paddingTop: `${headerHeight + 16}px` // Dynamic padding + 16px buffer
      }}>
          {children}
        </main>
      </div>

      {/* Overlay for mobile/tablet sidebar */}
      {sidebarOpen && <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />}
    </div>;
};
export default Layout;

