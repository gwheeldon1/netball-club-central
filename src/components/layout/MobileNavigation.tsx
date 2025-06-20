
import { useState } from "react";
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
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface NavItem {
  label: string;
  href: string;
  icon: any;
  badge?: number;
  roles?: string[];
}

export const MobileNavigation = () => {
  const { hasRole, userProfile, currentUser } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

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

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <img 
                src="/lovable-uploads/shot-tracker-main-logo.png" 
                alt="Club Manager Logo" 
                className="w-5 h-5"
              />
            </div>
            <span className="text-lg font-bold text-gradient">Club Manager</span>
          </div>
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsOpen(!isOpen)}
            className="h-10 w-10"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div className={cn(
        "lg:hidden fixed top-0 right-0 h-full w-80 max-w-[85vw] z-50 transform transition-transform duration-300 ease-in-out glass-card border-l border-border",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}>
        <div className="flex h-full flex-col">
          {/* User Profile */}
          {currentUser && (
            <div className="p-6 border-b border-border/50">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {getDisplayName().split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">{getDisplayName()}</p>
                  <p className="text-sm text-muted-foreground">{getPrimaryRole()}</p>
                </div>
              </div>
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
                      onClick={() => setIsOpen(false)}
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

          {/* Profile Link */}
          <div className="border-t border-border/50 p-4">
            <Link
              to="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-foreground hover:bg-accent/50 transition-all duration-200 card-hover"
            >
              <User className="h-5 w-5" />
              <span>Profile</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Spacer for mobile header */}
      <div className="lg:hidden h-16" />
    </>
  );
};
