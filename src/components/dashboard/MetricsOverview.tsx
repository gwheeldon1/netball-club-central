import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Users, Calendar, Trophy, DollarSign, Activity, UserCheck, AlertCircle, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { useOptimizedQuery } from "@/hooks/useOptimizedQuery";
import { supabase } from "@/integrations/supabase/client";
interface MetricCardProps {
  title: string;
  value: string;
  change: number;
  changeLabel: string;
  icon: React.ComponentType<{
    className?: string;
  }>;
  trend: "up" | "down" | "neutral";
  target?: string;
  status?: "on-track" | "at-risk" | "exceeded";
  loading?: boolean;
}
const MetricCard = ({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  trend,
  target,
  status,
  loading
}: MetricCardProps) => {
  const getTrendColor = () => {
    if (trend === "up") return "text-emerald-600 dark:text-emerald-400";
    if (trend === "down") return "text-red-600 dark:text-red-400";
    return "text-muted-foreground";
  };
  const getStatusColor = () => {
    switch (status) {
      case "exceeded":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300";
      case "at-risk":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      default:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
    }
  };
  const getTrendIcon = () => {
    if (trend === "up") return <TrendingUp className="h-3 w-3" />;
    if (trend === "down") return <TrendingDown className="h-3 w-3" />;
    return null;
  };
  if (loading) {
    return <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/30 dark:from-gray-950 dark:to-gray-900/30">
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-3 bg-gray-200 rounded w-full"></div>
          </div>
        </CardContent>
      </Card>;
  }
  return <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/30 dark:from-gray-950 dark:to-gray-900/30 hover:shadow-xl transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2">
              {title}
            </p>
            <div className="flex items-baseline space-x-2">
              <p className="text-3xl font-bold tracking-tight">{value}</p>
              {target && <span className="text-sm text-muted-foreground">/ {target}</span>}
            </div>
          </div>
          <div className="h-12 w-12 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary flex-shrink-0">
            <Icon className="h-6 w-6" />
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className={cn("flex items-center space-x-1 text-sm font-medium", getTrendColor())}>
            {getTrendIcon()}
            <span>{change > 0 ? "+" : ""}{change}%</span>
            <span className="text-muted-foreground font-normal">{changeLabel}</span>
          </div>
          {status && <Badge variant="secondary" className={cn("text-xs", getStatusColor())}>
              {status === "exceeded" ? "Exceeded" : status === "at-risk" ? "At Risk" : "On Track"}
            </Badge>}
        </div>
      </CardContent>
    </Card>;
};
export const MetricsOverview = () => {
  const {
    data: playersData,
    isLoading: playersLoading
  } = useOptimizedQuery({
    queryKey: ['active-players'],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('players').select('id').eq('approval_status', 'approved');
      if (error) throw error;
      return data?.length || 0;
    }
  });
  const {
    data: revenueData,
    isLoading: revenueLoading
  } = useOptimizedQuery({
    queryKey: ['monthly-revenue'],
    queryFn: async () => {
      const currentMonth = new Date();
      const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const {
        data,
        error
      } = await supabase.from('payments').select('amount_pence').eq('status', 'completed').gte('created_at', startOfMonth.toISOString());
      if (error) throw error;
      const total = data?.reduce((sum, payment) => sum + payment.amount_pence, 0) || 0;
      return Math.round(total / 100); // Convert to pounds
    }
  });
  const {
    data: attendanceData,
    isLoading: attendanceLoading
  } = useOptimizedQuery({
    queryKey: ['attendance-rate'],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.rpc('calculate_attendance_rate');
      if (error) throw error;
      return data || 0;
    }
  });
  const {
    data: eventsData,
    isLoading: eventsLoading
  } = useOptimizedQuery({
    queryKey: ['monthly-events'],
    queryFn: async () => {
      const currentMonth = new Date();
      const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const {
        data,
        error
      } = await supabase.from('events').select('id').gte('event_date', startOfMonth.toISOString());
      if (error) throw error;
      return data?.length || 0;
    }
  });
  const {
    data: teamsData,
    isLoading: teamsLoading
  } = useOptimizedQuery({
    queryKey: ['active-teams'],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('teams').select('id').eq('archived', false);
      if (error) throw error;
      return data?.length || 0;
    }
  });
  const {
    data: sessionData,
    isLoading: sessionLoading
  } = useOptimizedQuery({
    queryKey: ['avg-session-size'],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('event_responses').select('event_id').eq('rsvp_status', 'attending');
      if (error) throw error;
      const eventCounts: Record<string, number> = {};
      data?.forEach(response => {
        eventCounts[response.event_id] = (eventCounts[response.event_id] || 0) + 1;
      });
      const totalEvents = Object.keys(eventCounts).length;
      const totalAttendees = Object.values(eventCounts).reduce((sum, count) => sum + count, 0);
      return totalEvents > 0 ? Math.round(totalAttendees / totalEvents) : 0;
    }
  });
  const metrics = [{
    title: "Active Players",
    value: playersData?.toString() || "0",
    change: 8.2,
    changeLabel: "vs last month",
    icon: Users,
    trend: "up" as const,
    target: "250",
    status: "on-track" as const,
    loading: playersLoading
  }, {
    title: "Monthly Revenue",
    value: `£${revenueData?.toLocaleString() || '0'}`,
    change: 12.5,
    changeLabel: "vs last month",
    icon: DollarSign,
    trend: "up" as const,
    target: "£5,000",
    status: (revenueData || 0) > 5000 ? "exceeded" as const : "on-track" as const,
    loading: revenueLoading
  }, {
    title: "Attendance Rate",
    value: `${Math.round(attendanceData || 0)}%`,
    change: 3.1,
    changeLabel: "vs last month",
    icon: UserCheck,
    trend: "up" as const,
    target: "85%",
    status: (attendanceData || 0) > 85 ? "exceeded" as const : "on-track" as const,
    loading: attendanceLoading
  }, {
    title: "Events This Month",
    value: eventsData?.toString() || "0",
    change: -5.2,
    changeLabel: "vs last month",
    icon: Calendar,
    trend: "down" as const,
    target: "35",
    status: (eventsData || 0) < 30 ? "at-risk" as const : "on-track" as const,
    loading: eventsLoading
  }, {
    title: "Teams Active",
    value: teamsData?.toString() || "0",
    change: 0,
    changeLabel: "no change",
    icon: Trophy,
    trend: "neutral" as const,
    status: "on-track" as const,
    loading: teamsLoading
  }, {
    title: "Avg Session Size",
    value: sessionData?.toString() || "0",
    change: 5.9,
    changeLabel: "vs last month",
    icon: Activity,
    trend: "up" as const,
    target: "20",
    status: "on-track" as const,
    loading: sessionLoading
  }];
  return <div className="space-y-6">
      
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((metric, index) => <MetricCard key={index} {...metric} />)}
      </div>
    </div>;
};