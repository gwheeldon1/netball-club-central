
import { ReactNode, useState } from "react";
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
  Home
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { currentUser, logout, hasRole } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="rounded-full"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-white shadow-lg transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Close button (mobile only) */}
          <div className="lg:hidden absolute top-4 right-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={closeSidebar}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Logo and app name */}
          <div className="flex items-center gap-2 px-6 py-5 border-b">
            <div className="flex items-center justify-center w-10 h-10 bg-netball-400 rounded-full">
              <Award className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold">Netball Club</span>
          </div>

          {/* User info */}
          {currentUser && (
            <div className="border-b p-4">
              <div className="flex items-center gap-3">
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
                  <span className="font-medium truncate">{currentUser.name}</span>
                  <span className="text-xs text-gray-500">
                    {currentUser.roles.map((role) => 
                      role.charAt(0).toUpperCase() + role.slice(1)
                    ).join(", ")}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Navigation links */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="flex items-center gap-3 rounded-md px-3 py-2 text-gray-700 hover:bg-gray-100"
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
                    className="flex items-center gap-3 rounded-md px-3 py-2 text-gray-700 hover:bg-gray-100"
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
                  className="flex items-center gap-3 rounded-md px-3 py-2 text-gray-700 hover:bg-gray-100"
                  onClick={closeSidebar}
                >
                  <Award className="h-5 w-5" />
                  <span>Teams</span>
                </Link>
              </li>

              <li>
                <Link
                  to="/events"
                  className="flex items-center gap-3 rounded-md px-3 py-2 text-gray-700 hover:bg-gray-100"
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
                    className="flex items-center gap-3 rounded-md px-3 py-2 text-gray-700 hover:bg-gray-100"
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
                    className="flex items-center gap-3 rounded-md px-3 py-2 text-gray-700 hover:bg-gray-100"
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
                className="w-full justify-start gap-3 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
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
      <div className="flex-1 lg:pl-64">
        <main className="min-h-screen p-6">
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
