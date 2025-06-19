
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Users, Target, Calendar, Trophy, TrendingUp, Activity, Clock, UserCheck, AlertCircle, Award } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { EnhancedChartCard } from "@/components/dashboard/EnhancedChartCard";
import { KPIGrid } from "@/components/dashboard/KPIGrid";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from "recharts";
import { analyticsApi, DashboardStats, AttendanceData, TeamAttendanceData } from "@/services/api/analytics";
import { toast } from "@/hooks/use-toast";

export const EnhancedAnalyticsDashboard = () => {
  const [timeRange, setTimeRange] = useState("30d");
  const [loading, setLoading] = useState(false);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats[]>([]);
  const [attendanceTrends, setAttendanceTrends] = useState<AttendanceData[]>([]);
  const [teamAttendance, setTeamAttendance] = useState<TeamAttendanceData[]>([]);
  const [eventDistribution, setEventDistribution] = useState<Array<{name: string; value: number; color: string}>>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  const chartColors = {
    primary: "hsl(171, 75%, 41%)",
    secondary: "hsl(200, 95%, 50%)",
    tertiary: "hsl(52, 100%, 50%)",
    accent: "hsl(310, 100%, 50%)",
    subtle: "hsl(230, 100%, 50%)",
    success: "hsl(142, 76%, 36%)",
    warning: "hsl(38, 92%, 50%)",
    error: "hsl(0, 84%, 60%)"
  };

  useEffect(() => {
    loadDashboardData();
  }, [timeRange]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [stats, trends, teamData, eventTypes, activities] = await Promise.all([
        analyticsApi.getDashboardStats(),
        analyticsApi.getAttendanceTrends(undefined, 6),
        analyticsApi.getTeamAttendanceComparison(),
        analyticsApi.getEventTypeDistribution(getDaysFromTimeRange(timeRange)),
        analyticsApi.getRecentActivities(8)
      ]);

      setDashboardStats(stats);
      setAttendanceTrends(trends);
      setTeamAttendance(teamData);
      
      const enhancedEventTypes = eventTypes.map((item, index) => ({
        ...item,
        color: Object.values(chartColors)[index % Object.values(chartColors).length]
      }));
      setEventDistribution(enhancedEventTypes);
      setRecentActivities(activities);

      analyticsApi.trackEvent({
        event_type: 'page_view',
        event_name: 'enhanced_analytics_dashboard_viewed',
        properties: { timeRange, timestamp: new Date().toISOString() }
      });

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadDashboardData();
  };

  const getDaysFromTimeRange = (range: string): number => {
    switch (range) {
      case "7d": return 7;
      case "30d": return 30;
      case "90d": return 90;
      case "1y": return 365;
      default: return 30;
    }
  };

  const getStatValue = (metric: string): string => {
    const stat = dashboardStats.find(s => s.metric === metric);
    return stat ? stat.value : "0";
  };

  const calculateTrend = (data: AttendanceData[]): number => {
    if (data.length < 2) return 0;
    const recent = data.slice(-3).reduce((sum, item) => sum + item.attendance, 0) / 3;
    const older = data.slice(0, 3).reduce((sum, item) => sum + item.attendance, 0) / 3;
    return Math.round(((recent - older) / older) * 100);
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-muted rounded w-1/3"></div>
        <KPIGrid>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded-lg"></div>
          ))}
        </KPIGrid>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-96 bg-muted rounded-lg"></div>
          <div className="h-96 bg-muted rounded-lg"></div>
        </div>
      </div>
    );
  }

  const attendanceTrend = calculateTrend(attendanceTrends);
  const avgAttendance = attendanceTrends.length > 0 
    ? Math.round(attendanceTrends.reduce((sum, item) => sum + item.attendance, 0) / attendanceTrends.length)
    : 0;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Analytics Overview</h1>
          <p className="text-muted-foreground">
            Real-time insights into club performance and engagement
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleRefresh} disabled={loading} variant="outline" className="w-full sm:w-auto">
            <TrendingUp className="mr-2 h-4 w-4" />
            {loading ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <KPIGrid cols={4}>
        <StatCard
          title="Active Players"
          value={getStatValue('total_players')}
          change={5.2}
          changeLabel="vs last month"
          icon={<Users className="h-6 w-6" />}
          trend="up"
        />
        <StatCard
          title="Teams Running"
          value={getStatValue('active_teams')}
          change={0}
          changeLabel="this season"
          icon={<Trophy className="h-6 w-6" />}
          trend="neutral"
        />
        <StatCard
          title="Events This Month"
          value={getStatValue('events_this_month')}
          change={12.3}
          changeLabel="vs last month"
          icon={<Calendar className="h-6 w-6" />}
          trend="up"
        />
        <StatCard
          title="Attendance Rate"
          value={`${avgAttendance}%`}
          change={attendanceTrend}
          changeLabel="trend"
          icon={<UserCheck className="h-6 w-6" />}
          trend={attendanceTrend > 0 ? "up" : attendanceTrend < 0 ? "down" : "neutral"}
        />
      </KPIGrid>

      {/* Secondary KPIs */}
      <KPIGrid cols={3}>
        <StatCard
          title="Response Rate"
          value="87%"
          change={3.1}
          changeLabel="RSVP responses"
          icon={<Clock className="h-5 w-5" />}
          size="sm"
          trend="up"
        />
        <StatCard
          title="Player of Match Awards"
          value="24"
          change={-5.2}
          changeLabel="this month"
          icon={<Award className="h-5 w-5" />}
          size="sm"
          trend="down"
        />
        <StatCard
          title="Active Issues"
          value="3"
          changeLabel="requiring attention"
          icon={<AlertCircle className="h-5 w-5" />}
          size="sm"
          trend="neutral"
        />
      </KPIGrid>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Trends */}
        <EnhancedChartCard
          title="Attendance Trends"
          description="Monthly attendance patterns across all teams"
          fullHeight
        >
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={attendanceTrends}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
              <XAxis 
                dataKey="month" 
                className="text-muted-foreground"
                fontSize={12}
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                className="text-muted-foreground"
                fontSize={12}
                tick={{ fontSize: 12 }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "12px",
                  boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)"
                }}
              />
              <Area 
                type="monotone" 
                dataKey="attendance" 
                stroke={chartColors.primary}
                fill={chartColors.primary}
                fillOpacity={0.2}
                strokeWidth={3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </EnhancedChartCard>

        {/* Event Distribution */}
        <EnhancedChartCard
          title="Event Types"
          description="Distribution of training vs matches"
          fullHeight
        >
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={eventDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={5}
                dataKey="value"
              >
                {eventDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "12px",
                  boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)"
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          {eventDistribution.length > 0 && (
            <div className="flex justify-center flex-wrap gap-3 mt-4">
              {eventDistribution.map((item) => (
                <div key={item.name} className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm font-medium">
                    {item.name} ({item.value}%)
                  </span>
                </div>
              ))}
            </div>
          )}
        </EnhancedChartCard>
      </div>

      {/* Team Performance Comparison */}
      <EnhancedChartCard
        title="Team Attendance Comparison"
        description="Compare attendance rates across different teams"
        actions={
          <Badge variant="outline" className="text-xs">
            Last {timeRange}
          </Badge>
        }
      >
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={teamAttendance} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
            <XAxis 
              dataKey="team" 
              className="text-muted-foreground"
              fontSize={12}
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              className="text-muted-foreground"
              fontSize={12}
              tick={{ fontSize: 12 }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "12px",
                boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)"
              }}
            />
            <Bar 
              dataKey="attendance" 
              fill={chartColors.primary}
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </EnhancedChartCard>

      {/* Recent Activity */}
      <EnhancedChartCard
        title="Recent Activity"
        description="Latest events and system activity"
        actions={
          <Button variant="ghost" size="sm" className="text-xs">
            View all
          </Button>
        }
      >
        <div className="space-y-3">
          {recentActivities.slice(0, 6).map((activity, index) => (
            <div key={activity.id || index} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-accent/50 transition-colors">
              <div className="w-2 h-2 rounded-full bg-primary"></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{activity.title}</p>
                <p className="text-xs text-muted-foreground">{activity.description}</p>
              </div>
              <div className="text-xs text-muted-foreground">
                {activity.timestamp ? new Date(activity.timestamp).toLocaleDateString() : 'Recent'}
              </div>
            </div>
          ))}
        </div>
      </EnhancedChartCard>
    </div>
  );
};
