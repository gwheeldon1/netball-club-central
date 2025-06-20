
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { 
  Home, 
  Users, 
  Calendar, 
  Trophy, 
  BarChart3,
  Settings,
  User,
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";

interface NavItem {
  label: string;
  href: string;
  icon: any;
  badge?: number;
  roles?: string[];
}

export const DesktopSidebar = () => {
  const { hasRole, userProfile, currentUser, logout } = useAuth();
  const location = useLocation();

  const navItems: NavItem[] = [
    { label: "Dashboard", href: "/", icon: Home },
    { label: "Teams", href: "/teams", icon: Trophy },
    { label: "Events", href: "/events", icon: Calendar },
    { label: "Analytics", href: "/analytics", icon: BarChart3 },
    { 
      label: "Players", 
      href: "/players", 
      icon: Users, 
      roles: ["admin", "coach", "manager"] 
    },
    { 
      label: "Settings", 
      href: "/settings", 
      icon: Settings, 
      roles: ["admin"] 
    },
  ];

  const filteredNavItems = navItems.filter(item => 
    !item.roles || item.roles.some(role => hasRole(role as any))
  );

  const getDisplayName = () => {
    if (userProfile?.firstName && userProfile?.lastName) {
      return `${userProfile.firstName} ${userProfile.lastName}`;
    }
    if (currentUser?.email) {
      return currentUser.email.split('@')[0];
    }
    return 'User';
  };

  const getPrimaryRole = () => {
    if (hasRole('admin')) return 'Admin';
    if (hasRole('coach')) return 'Coach';
    if (hasRole('manager')) return 'Manager';
    if (hasRole('parent')) return 'Parent';
    return 'Member';
  };

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
  };

  return (
    <div className="hidden lg:flex lg:w-80 lg:flex-col">
      <div className="flex h-full flex-col glass-card border-r border-border">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-border/50">
          <div className="w-10 h-10 rounded-xl gradient-primary shadow-glow flex items-center justify-center">
            <img 
              src="/lovable-uploads/shot-tracker-main-logo.png" 
              alt="Club Manager Logo" 
              className="w-6 h-6"
            />
          </div>
          <span className="text-xl font-bold text-gradient">Club Manager</span>
        </div>

        {/* User Profile */}
        {currentUser && (
          <div className="border-b border-border/50 p-6">
            <Link 
              to="/profile" 
              className="flex items-center gap-3 hover:bg-accent/50 rounded-xl p-3 transition-all duration-200 card-hover"
            >
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {getDisplayName().split(' ').map(n => n[0]).join('').slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="font-medium truncate hover:text-primary transition-colors">
                  {getDisplayName()}
                </p>
                <p className="text-sm text-muted-foreground">{getPrimaryRole()}</p>
              </div>
            </Link>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-2">
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;

              return (
                <li key={item.href}>
                  <Link 
                    to={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 card-hover",
                      isActive 
                        ? "bg-primary text-primary-foreground shadow-glow" 
                        : "text-foreground hover:bg-accent/50"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                    {item.badge && (
                      <Badge variant="secondary" className="ml-auto">
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout */}
        {currentUser && (
          <div className="border-t border-border/50 p-4">
            <Button 
              variant="ghost" 
              className="w-full justify-start gap-3 text-sm font-medium text-foreground hover:bg-accent/50 transition-all duration-200 py-3 h-auto rounded-xl" 
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
              <span>Log out</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
