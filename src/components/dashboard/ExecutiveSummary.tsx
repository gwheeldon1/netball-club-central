
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useOptimizedQuery } from "@/hooks/useOptimizedQuery";
import { supabase } from "@/integrations/supabase/client";

interface ExecutiveSummaryProps {
  period: string;
}

interface Insight {
  type: "success" | "warning" | "insight";
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action: string;
}

export const ExecutiveSummary = ({ period }: ExecutiveSummaryProps) => {
  const { data: attendanceData } = useOptimizedQuery({
    queryKey: ['attendance-insights', period],
    queryFn: async () => {
      const days = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 180;
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const { data, error } = await supabase.rpc('calculate_attendance_rate', {
        p_start_date: startDate,
        p_end_date: new Date().toISOString().split('T')[0]
      });
      
      if (error) throw error;
      return data;
    }
  });

  const { data: overduePayments } = useOptimizedQuery({
    queryKey: ['overdue-payments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payments')
        .select('amount_pence, guardian_id')
        .eq('status', 'failed')
        .or('status.eq.pending');
      
      if (error) throw error;
      return data;
    }
  });

  const { data: teamStats } = useOptimizedQuery({
    queryKey: ['team-stats', period],
    queryFn: async () => {
      const { data: events, error } = await supabase
        .from('events')
        .select(`
          id,
          event_date,
          event_responses!inner(
            rsvp_status,
            attended
          )
        `)
        .gte('event_date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
      
      if (error) throw error;
      
      // Calculate peak days
      const dayStats: Record<string, number> = {};
      events?.forEach(event => {
        const day = new Date(event.event_date).toLocaleDateString('en-US', { weekday: 'long' });
        dayStats[day] = (dayStats[day] || 0) + event.event_responses.length;
      });
      
      const peakDay = Object.entries(dayStats).sort(([,a], [,b]) => b - a)[0];
      return { peakDay: peakDay?.[0] || 'Tuesday' };
    }
  });

  const insights: Insight[] = [
    {
      type: "success",
      icon: CheckCircle,
      title: "Strong Attendance Growth",
      description: `Attendance rate is ${attendanceData ? Math.round(attendanceData) : 0}% this period with consistent participation across teams.`,
      action: "Continue current engagement strategies"
    },
    {
      type: "warning", 
      icon: AlertTriangle,
      title: "Payment Collection Alert",
      description: `${overduePayments?.length || 0} overdue payments requiring follow-up. Total outstanding: £${overduePayments?.reduce((sum, p) => sum + (p.amount_pence / 100), 0).toFixed(2) || '0'}.`,
      action: "Review payment collection process"
    },
    {
      type: "insight",
      icon: TrendingUp,
      title: "Peak Training Days",
      description: `${teamStats?.peakDay || 'Tuesday'} sessions show highest engagement. Consider adding capacity.`,
      action: "Explore additional session slots"
    }
  ];

  const getInsightStyles = (type: string) => {
    switch (type) {
      case 'success':
        return "border-l-4 border-l-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20";
      case 'warning':
        return "border-l-4 border-l-amber-500 bg-amber-50/50 dark:bg-amber-950/20";
      default:
        return "border-l-4 border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20";
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'success':
        return "text-emerald-600 dark:text-emerald-400";
      case 'warning':
        return "text-amber-600 dark:text-amber-400";
      default:
        return "text-blue-600 dark:text-blue-400";
    }
  };

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/30 dark:from-gray-950 dark:to-gray-900/30">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold">Executive Summary</CardTitle>
          <Badge variant="outline" className="text-xs">
            {period === '7d' ? 'Last 7 days' : period === '30d' ? 'Last 30 days' : period === '90d' ? 'Last 90 days' : 'Last 6 months'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.map((insight, index) => {
          const Icon = insight.icon;
          return (
            <div
              key={index}
              className={cn(
                "p-4 rounded-lg transition-all duration-200 hover:shadow-md",
                getInsightStyles(insight.type)
              )}
            >
              <div className="flex items-start space-x-3">
                <Icon className={cn("h-5 w-5 mt-0.5 flex-shrink-0", getIconColor(insight.type))} />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm mb-1">{insight.title}</h4>
                  <p className="text-sm text-muted-foreground mb-2 leading-relaxed">
                    {insight.description}
                  </p>
                  <p className="text-xs font-medium text-primary">
                    → {insight.action}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
