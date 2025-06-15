
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarDays, Users, Calendar, Trophy, TrendingUp, Activity } from "lucide-react";
import { DashboardGrid } from "@/components/dashboard/DashboardGrid";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { ProgressCard } from "@/components/dashboard/ProgressCard";
import { ActivityCard } from "@/components/dashboard/ActivityCard";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { analyticsApi, DashboardStats, AttendanceData, TeamAttendanceData } from "@/services/api/analytics";
import { toast } from "@/hooks/use-toast";

export const AnalyticsDashboard = () => {
  const [timeRange, setTimeRange] = useState("30d");
  const [loading, setLoading] = useState(false);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats[]>([]);
  const [attendanceTrends, setAttendanceTrends] = useState<AttendanceData[]>([]);
  const [teamAttendance, setTeamAttendance] = useState<TeamAttendanceData[]>([]);
  const [eventDistribution, setEventDistribution] = useState<Array<{name: string; value: number; color: string}>>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  // Cohesive teal color palette for charts
  const chartColors = {
    primary: "hsl(var(--chart-1))",
    secondary: "hsl(var(--chart-2))",
    tertiary: "hsl(var(--chart-3))",
    accent: "hsl(var(--chart-4))",
    subtle: "hsl(var(--chart-5))",
    vibrant: "hsl(var(--chart-6))"
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
        analyticsApi.getRecentActivities(5)
      ]);

      setDashboardStats(stats);
      setAttendanceTrends(trends);
      setTeamAttendance(teamData);
      
      // Update event distribution with cohesive colors
      const enhancedEventTypes = eventTypes.map((item, index) => ({
        ...item,
        color: Object.values(chartColors)[index % Object.values(chartColors).length]
      }));
      setEventDistribution(enhancedEventTypes);
      setRecentActivities(activities);

      analyticsApi.trackEvent({
        event_type: 'page_view',
        event_name: 'analytics_dashboard_viewed',
        properties: { timeRange }
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

  const headerActions = (
    <>
      <Select value={timeRange} onValueChange={setTimeRange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select time range" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="7d">Last 7 days</SelectItem>
          <SelectItem value="30d">Last 30 days</SelectItem>
          <SelectItem value="90d">Last 90 days</SelectItem>
          <SelectItem value="1y">Last year</SelectItem>
        </SelectContent>
      </Select>
      <Button onClick={handleRefresh} disabled={loading} className="shadow-glow">
        <TrendingUp className="mr-2 h-4 w-4" />
        {loading ? "Refreshing..." : "Refresh"}
      </Button>
    </>
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <DashboardHeader
        title="Analytics Dashboard"
        description="Track performance, attendance, and engagement across your netball club"
        actions={headerActions}
      />

      {/* Key Metrics with enhanced styling */}
      <DashboardGrid cols={4}>
        <MetricCard
          title="Total Players"
          value={getStatValue('total_players')}
          subtitle="Registered players"
          icon={<Users className="h-8 w-8" />}
          gradient="primary"
          className="animate-scale-in"
        />
        <MetricCard
          title="Active Teams"
          value={getStatValue('active_teams')}
          subtitle="Across all age groups"
          icon={<Trophy className="h-8 w-8" />}
          gradient="secondary"
          className="animate-scale-in"
          style={{ animationDelay: '100ms' }}
        />
        <MetricCard
          title="Events This Month"
          value={getStatValue('events_this_month')}
          subtitle="Training & matches"
          icon={<Calendar className="h-8 w-8" />}
          gradient="tertiary"
          className="animate-scale-in"
          style={{ animationDelay: '200ms' }}
        />
        <MetricCard
          title="Average Attendance"
          value={`${getStatValue('avg_attendance')}%`}
          subtitle="Club-wide attendance"
          icon={<Activity className="h-8 w-8" />}
          gradient="accent"
          className="animate-scale-in"
          style={{ animationDelay: '300ms' }}
        />
      </DashboardGrid>

      {/* Enhanced detailed stats */}
      <DashboardGrid cols={4}>
        <StatsCard
          title="Weekly Attendance"
          value={`${getStatValue('avg_attendance')}%`}
          change={5.2}
          changeLabel="vs last week"
          icon={<Users className="h-4 w-4" />}
          variant="success"
          className="glass-card"
        />
        <StatsCard
          title="Event Responses"
          value="89%"
          change={-2.1}
          changeLabel="response rate"
          icon={<CalendarDays className="h-4 w-4" />}
          variant="warning"
          className="glass-card"
        />
        <ProgressCard
          title="Season Progress"
          value={24}
          maxValue={40}
          label="weeks completed"
          description="16 weeks remaining in current season"
          icon={<Calendar className="h-4 w-4" />}
          variant="default"
          className="glass-card"
        />
        <ProgressCard
          title="Team Registrations"
          value={parseInt(getStatValue('total_players'))}
          maxValue={300}
          label="players registered"
          description="Target: 300 players for the season"
          icon={<Users className="h-4 w-4" />}
          variant="success"
          className="glass-card"
        />
      </DashboardGrid>

      {/* Enhanced charts with cohesive styling */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ChartCard
          title="Monthly Attendance Trends"
          description="Track attendance patterns over time"
          className="glass-card animate-slide-in"
        >
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={attendanceTrends}>
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
                  boxShadow: "var(--shadow-elevation-medium)"
                }}
              />
              <Line 
                type="monotone" 
                dataKey="attendance" 
                stroke={chartColors.primary}
                strokeWidth={3}
                dot={{ fill: chartColors.primary, strokeWidth: 2, r: 5 }}
                activeDot={{ r: 6, stroke: chartColors.primary, strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Event Distribution"
          description={`Breakdown of event types (${timeRange})`}
          className="glass-card animate-slide-in"
          style={{ animationDelay: '200ms' }}
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
                  boxShadow: "var(--shadow-elevation-medium)"
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          {eventDistribution.length > 0 && (
            <div className="flex justify-center flex-wrap gap-4 mt-6">
              {eventDistribution.map((item) => (
                <div key={item.name} className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full shadow-sm" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-muted-foreground font-medium">
                    {item.name} ({item.value}%)
                  </span>
                </div>
              ))}
            </div>
          )}
        </ChartCard>
      </div>

      {/* Enhanced activity and comparison section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <ChartCard
            title="Team Attendance Comparison"
            description="Compare attendance across different teams"
            className="glass-card animate-slide-in"
            style={{ animationDelay: '400ms' }}
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={teamAttendance}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
                <XAxis 
                  dataKey="team" 
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
                    boxShadow: "var(--shadow-elevation-medium)"
                  }}
                />
                <Bar 
                  dataKey="attendance" 
                  fill={chartColors.primary}
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <ActivityCard
          title="Recent Activity"
          activities={recentActivities}
          className="lg:col-span-1 glass-card animate-slide-in"
          style={{ animationDelay: '600ms' }}
        />
      </div>
    </div>
  );
};
