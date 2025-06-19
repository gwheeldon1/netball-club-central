
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  Users, 
  Settings, 
  Activity,
  Database,
  BarChart3,
  UserCog,
  Calendar,
  Trophy
} from "lucide-react";
import { useEnterprisePermissions } from "@/hooks/useEnterprisePermissions";

const adminNavItems = [
  {
    label: "Dashboard",
    href: "/",
    icon: BarChart3,
    permission: null
  },
  {
    label: "Users",
    href: "/users",
    icon: Users,
    permission: "users.view.all"
  },
  {
    label: "Teams",
    href: "/teams",
    icon: Trophy,
    permission: "teams.view.all"
  },
  {
    label: "Events",
    href: "/events",
    icon: Calendar,
    permission: "events.view.all"
  },
  {
    label: "Analytics",
    href: "/analytics",
    icon: Activity,
    permission: "analytics.view.all"
  },
  {
    label: "Admin",
    href: "/admin",
    icon: Shield,
    permission: "settings.manage"
  }
];

export const AdminNavigation = () => {
  const location = useLocation();
  const { hasPermission } = useEnterprisePermissions();

  const filteredNavItems = adminNavItems.filter(item => 
    !item.permission || hasPermission(item.permission)
  );

  return (
    <nav className="space-y-2">
      {filteredNavItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.href;

        return (
          <Link key={item.href} to={item.href}>
            <Button
              variant={isActive ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start gap-2",
                isActive && "bg-secondary"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Button>
          </Link>
        );
      })}
    </nav>
  );
};
