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
  TrendingUp,
  Activity
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useOptimizedQuery } from "@/hooks/useOptimizedQuery";
import { supabase } from "@/integrations/supabase/client";

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
  const { data: overduePayments } = useOptimizedQuery({
    queryKey: ['overdue-payments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          id,
          amount_pence,
          guardian_id,
          created_at,
          guardians(first_name, last_name)
        `)
        .eq('status', 'failed')
        .order('created_at', { ascending: false })
        .limit(3);
      
      if (error) throw error;
      return data;
    }
  });

  const { data: pendingRegistrations } = useOptimizedQuery({
    queryKey: ['pending-registrations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('players')
        .select(`
          id,
          first_name,
          last_name,
          created_at
        `)
        .eq('approval_status', 'pending')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data;
    }
  });

  const { data: recentActivities } = useOptimizedQuery({
    queryKey: ['recent-activities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('analytics_events')
        .select(`
          id,
          event_type,
          event_name,
          properties,
          timestamp,
          user_id
        `)
        .order('timestamp', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      
      return data?.map(event => ({
        id: event.id,
        type: event.event_type === 'attendance' ? 'attendance' : 
              event.event_type === 'payment' ? 'payment' :
              event.event_type === 'registration' ? 'registration' : 'achievement',
        title: formatEventTitle(event.event_name),
        description: formatEventDescription(event.properties),
        timestamp: formatTimeAgo(event.timestamp),
        status: getEventStatus(event.event_type),
        user: event.user_id ? {
          name: 'User',
          initials: 'U'
        } : undefined
      })) || [];
    }
  });

  const actionItems = [
    ...(overduePayments?.map(payment => ({
      id: payment.id,
      type: "urgent" as const,
      title: "Overdue Payment",
      description: `£${(payment.amount_pence / 100).toFixed(2)} payment from ${payment.guardians?.first_name} ${payment.guardians?.last_name}`,
      action: "Send reminder",
      dueDate: "Overdue",
      assignee: { name: "Finance Team", initials: "FT" },
      priority: "high" as const
    })) || []),
    
    ...(pendingRegistrations?.length ? [{
      id: "registrations",
      type: "info" as const,
      title: "New Registration Approvals",
      description: `${pendingRegistrations.length} new player applications awaiting approval`,
      action: "Review applications",
      assignee: { name: "Admin Team", initials: "AT" },
      priority: "medium" as const
    }] : [])
  ];

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
          {actionItems.length > 0 ? (
            actionItems.map((item) => (
              <ActionItem key={item.id} item={item} />
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-2 text-emerald-500" />
              <p>No pending actions</p>
            </div>
          )}
          {actionItems.length > 0 && (
            <Button variant="ghost" className="w-full text-sm">
              View all actions
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
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
          {recentActivities?.length ? (
            recentActivities.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-2" />
              <p>No recent activity</p>
            </div>
          )}
          {recentActivities?.length && (
            <Button variant="ghost" className="w-full text-sm mt-4">
              View activity feed
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Helper functions
function formatEventTitle(eventName: string): string {
  return eventName.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
}

function formatEventDescription(properties: any): string {
  if (properties?.description) return properties.description;
  if (properties?.event_type) return `${properties.event_type} event`;
  if (properties?.team) return `Related to ${properties.team}`;
  return 'Activity recorded';
}

function formatTimeAgo(timestamp: string): string {
  const now = new Date();
  const eventTime = new Date(timestamp);
  const diffInHours = Math.floor((now.getTime() - eventTime.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return 'Less than an hour ago';
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  return `${Math.floor(diffInHours / 24)} days ago`;
}

function getEventStatus(eventType: string): 'success' | 'warning' | 'error' | 'info' {
  switch (eventType) {
    case 'attendance':
      return 'success';
    case 'payment':
      return 'info';
    case 'error':
      return 'error';
    default:
      return 'info';
  }
}
