import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface ActivityItem {
  id: string;
  type: "user" | "system" | "event";
  title: string;
  description: string;
  timestamp: Date;
  user?: {
    name: string;
    avatar?: string;
    initials: string;
  };
  status?: "success" | "warning" | "error" | "info";
  icon?: ReactNode;
}

interface ActivityCardProps {
  title: string;
  activities: ActivityItem[];
  className?: string;
  maxItems?: number;
}

export const ActivityCard = ({
  title,
  activities,
  className,
  maxItems = 5
}: ActivityCardProps) => {
  const getStatusColor = (status?: string) => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-800";
      case "warning":
        return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-300 dark:border-yellow-800";
      case "error":
        return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-300 dark:border-red-800";
      case "info":
        return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-800";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const displayedActivities = activities.slice(0, maxItems);

  return (
    <Card className={cn("transition-all duration-200 hover:shadow-md", className)}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {displayedActivities.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No recent activity
          </p>
        ) : (
          displayedActivities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3">
              {activity.user ? (
                <Avatar className="h-8 w-8 mt-0.5">
                  <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
                  <AvatarFallback className="text-xs">
                    {activity.user.initials}
                  </AvatarFallback>
                </Avatar>
              ) : activity.icon ? (
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center mt-0.5">
                  <div className="h-4 w-4 text-muted-foreground">
                    {activity.icon}
                  </div>
                </div>
              ) : null}
              
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{activity.title}</p>
                  {activity.status && (
                    <Badge variant="outline" className={cn("text-xs", getStatusColor(activity.status))}>
                      {activity.status}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{activity.description}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                </p>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};