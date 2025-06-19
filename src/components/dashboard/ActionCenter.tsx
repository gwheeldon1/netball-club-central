
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  Users, 
  Calendar, 
  DollarSign,
  ArrowRight,
  Star,
  MessageSquare,
  TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ActionItem {
  id: string;
  type: "urgent" | "important" | "info";
  title: string;
  description: string;
  action: string;
  dueDate?: string;
  assignee?: {
    name: string;
    avatar?: string;
    initials: string;
  };
  priority: "high" | "medium" | "low";
}

interface RecentActivity {
  id: string;
  type: "attendance" | "payment" | "registration" | "achievement";
  title: string;
  description: string;
  timestamp: string;
  user?: {
    name: string;
    avatar?: string;
    initials: string;
  };
  status: "success" | "warning" | "info";
}

const actionItems: ActionItem[] = [
  {
    id: "1",
    type: "urgent",
    title: "Overdue Payments",
    description: "3 families have payments overdue totaling £240",
    action: "Send payment reminders",
    dueDate: "Today",
    assignee: { name: "Sarah Johnson", initials: "SJ" },
    priority: "high"
  },
  {
    id: "2",
    type: "important", 
    title: "Equipment Maintenance",
    description: "Annual safety check due for training equipment",
    action: "Schedule inspection",
    dueDate: "This week",
    assignee: { name: "Mike Chen", initials: "MC" },
    priority: "medium"
  },
  {
    id: "3",
    type: "info",
    title: "New Registration Approvals",
    description: "5 new player applications awaiting approval",
    action: "Review applications",
    assignee: { name: "Emma Davis", initials: "ED" },
    priority: "medium"
  }
];

const recentActivities: RecentActivity[] = [
  {
    id: "1",
    type: "achievement",
    title: "Player of the Match",
    description: "Jessica Smith awarded Player of the Match for exceptional performance",
    timestamp: "2 hours ago",
    user: { name: "Jessica Smith", initials: "JS" },
    status: "success"
  },
  {
    id: "2",
    type: "registration",
    title: "New Player Registration",
    description: "Tom Wilson has completed registration for Under 12s team",
    timestamp: "4 hours ago",
    user: { name: "Tom Wilson", initials: "TW" },
    status: "info"
  },
  {
    id: "3",
    type: "payment",
    title: "Subscription Renewed",
    description: "The Roberts family renewed their annual subscription",
    timestamp: "6 hours ago",
    status: "success"
  },
  {
    id: "4",
    type: "attendance",
    title: "High Attendance Alert",
    description: "Under 10s training session reached 95% attendance",
    timestamp: "1 day ago",
    status: "success"
  }
];

const ActionItem = ({ item }: { item: ActionItem }) => {
  const getTypeStyles = (type: string) => {
    switch (type) {
      case "urgent":
        return "border-l-4 border-l-red-500 bg-red-50/50 dark:bg-red-950/20";
      case "important":
        return "border-l-4 border-l-amber-500 bg-amber-50/50 dark:bg-amber-950/20";
      default:
        return "border-l-4 border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      case "medium":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300";
      default:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
    }
  };

  return (
    <div className={cn("p-4 rounded-lg transition-all duration-200 hover:shadow-md", getTypeStyles(item.type))}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <h4 className="font-semibold text-sm">{item.title}</h4>
            <Badge variant="secondary" className={cn("text-xs", getPriorityColor(item.priority))}>
              {item.priority}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
          {item.dueDate && (
            <div className="flex items-center text-xs text-muted-foreground mb-2">
              <Clock className="h-3 w-3 mr-1" />
              Due: {item.dueDate}
            </div>
          )}
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {item.assignee && (
            <>
              <Avatar className="h-6 w-6">
                <AvatarImage src={item.assignee.avatar} alt={item.assignee.name} />
                <AvatarFallback className="text-xs">{item.assignee.initials}</AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground">{item.assignee.name}</span>
            </>
          )}
        </div>
        <Button size="sm" variant="ghost" className="text-xs h-7">
          {item.action}
          <ArrowRight className="h-3 w-3 ml-1" />
        </Button>
      </div>
    </div>
  );
};

const ActivityItem = ({ activity }: { activity: RecentActivity }) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "attendance":
        return Users;
      case "payment":
        return DollarSign;
      case "registration":
        return Calendar;
      case "achievement":
        return Star;
      default:
        return CheckCircle;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "text-emerald-600 dark:text-emerald-400";
      case "warning":
        return "text-amber-600 dark:text-amber-400";
      default:
        return "text-blue-600 dark:text-blue-400";
    }
  };

  const Icon = getActivityIcon(activity.type);

  return (
    <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-accent/50 transition-colors">
      <div className={cn("p-2 rounded-lg", getStatusColor(activity.status))}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h4 className="font-medium text-sm truncate">{activity.title}</h4>
          <span className="text-xs text-muted-foreground">{activity.timestamp}</span>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{activity.description}</p>
        {activity.user && (
          <div className="flex items-center space-x-2 mt-2">
            <Avatar className="h-5 w-5">
              <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
              <AvatarFallback className="text-xs">{activity.user.initials}</AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground">{activity.user.name}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export const ActionCenter = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Action Items */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/30 dark:from-gray-950 dark:to-gray-900/30">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
              Action Required
            </CardTitle>
            <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
              {actionItems.length} items
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {actionItems.map((item) => (
            <ActionItem key={item.id} item={item} />
          ))}
          <Button variant="ghost" className="w-full text-sm">
            View all actions
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </CardContent>
      </Card>

      {/* Recent Activities */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/30 dark:from-gray-950 dark:to-gray-900/30">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-primary" />
              Recent Activity
            </CardTitle>
            <Button variant="ghost" size="sm">
              <MessageSquare className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {recentActivities.map((activity) => (
            <ActivityItem key={activity.id} activity={activity} />
          ))}
          <Button variant="ghost" className="w-full text-sm mt-4">
            View activity feed
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
