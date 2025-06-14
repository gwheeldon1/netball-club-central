import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

// Mock data - replace with real API calls
const mockAttendanceData = [
  { month: "Jan", attendance: 85 },
  { month: "Feb", attendance: 92 },
  { month: "Mar", attendance: 78 },
  { month: "Apr", attendance: 88 },
  { month: "May", attendance: 95 },
  { month: "Jun", attendance: 87 },
];

const mockEventTypeData = [
  { name: "Training", value: 45, color: "#3b82f6" },
  { name: "Matches", value: 25, color: "#ef4444" },
  { name: "Tournaments", value: 15, color: "#10b981" },
  { name: "Social", value: 15, color: "#f59e0b" },
];

const mockRecentActivities = [
  {
    id: "1",
    type: "event" as const,
    title: "New event created",
    description: "Training session scheduled for Saturday",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    status: "success" as const,
    user: {
      name: "Coach Smith",
      initials: "CS"
    }
  },
  {
    id: "2",
    type: "user" as const,
    title: "Player registered",
    description: "Emma Johnson joined U12 team",
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    status: "info" as const,
    user: {
      name: "Emma Johnson",
      initials: "EJ"
    }
  },
  {
    id: "3",
    type: "system" as const,
    title: "Match completed",
    description: "U14 vs Eagles - Won 15-12",
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    status: "success" as const,
    icon: <Trophy className="h-4 w-4" />
  }
];

export const AnalyticsOverview = () => {
  const [timeRange, setTimeRange] = useState("7d");
  const [loading, setLoading] = useState(false);

  const handleRefresh = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => setLoading(false), 1000);
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
      <Button onClick={handleRefresh} disabled={loading}>
        <TrendingUp className="mr-2 h-4 w-4" />
        {loading ? "Refreshing..." : "Refresh"}
      </Button>
    </>
  );

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Analytics Overview"
        description="Track performance, attendance, and engagement across your netball club"
        actions={headerActions}
      />

      {/* Key Metrics */}
      <DashboardGrid cols={4}>
        <MetricCard
          title="Total Players"
          value="247"
          subtitle="+12 this month"
          icon={<Users className="h-8 w-8" />}
          gradient="blue"
        />
        <MetricCard
          title="Active Teams"
          value="18"
          subtitle="Across all age groups"
          icon={<Trophy className="h-8 w-8" />}
          gradient="green"
        />
        <MetricCard
          title="Events This Month"
          value="32"
          subtitle="Training & matches"
          icon={<Calendar className="h-8 w-8" />}
          gradient="purple"
        />
        <MetricCard
          title="Avg Attendance"
          value="87%"
          subtitle="+5% from last month"
          icon={<Activity className="h-8 w-8" />}
          gradient="orange"
        />
      </DashboardGrid>

      {/* Detailed Stats */}
      <DashboardGrid cols={4}>
        <StatsCard
          title="Weekly Attendance"
          value="92%"
          change={8.2}
          changeLabel="vs last week"
          icon={<Users className="h-4 w-4" />}
          variant="success"
        />
        <StatsCard
          title="Event Responses"
          value="89%"
          change={-2.1}
          changeLabel="response rate"
          icon={<CalendarDays className="h-4 w-4" />}
          variant="warning"
        />
        <ProgressCard
          title="Season Progress"
          value={24}
          maxValue={40}
          label="weeks completed"
          description="16 weeks remaining in current season"
          icon={<Calendar className="h-4 w-4" />}
          variant="default"
        />
        <ProgressCard
          title="Team Registrations"
          value={247}
          maxValue={300}
          label="players registered"
          description="Target: 300 players for the season"
          icon={<Users className="h-4 w-4" />}
          variant="success"
        />
      </DashboardGrid>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Monthly Attendance Trends"
          description="Track attendance patterns over time"
        >
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={mockAttendanceData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="month" 
                className="text-muted-foreground"
                fontSize={12}
              />
              <YAxis 
                className="text-muted-foreground"
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px"
                }}
              />
              <Line 
                type="monotone" 
                dataKey="attendance" 
                stroke="hsl(var(--primary))" 
                strokeWidth={3}
                dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Event Distribution"
          description="Breakdown of event types this month"
        >
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={mockEventTypeData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={5}
                dataKey="value"
              >
                {mockEventTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px"
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center space-x-4 mt-4">
            {mockEventTypeData.map((item) => (
              <div key={item.name} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-muted-foreground">
                  {item.name} ({item.value}%)
                </span>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* Activity Feed and Additional Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChartCard
            title="Weekly Attendance by Team"
            description="Compare attendance across different teams"
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={[
                { team: "U8", attendance: 95 },
                { team: "U10", attendance: 88 },
                { team: "U12", attendance: 92 },
                { team: "U14", attendance: 85 },
                { team: "U16", attendance: 90 },
                { team: "Seniors", attendance: 87 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="team" 
                  className="text-muted-foreground"
                  fontSize={12}
                />
                <YAxis 
                  className="text-muted-foreground"
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }}
                />
                <Bar 
                  dataKey="attendance" 
                  fill="hsl(var(--primary))" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <ActivityCard
          title="Recent Activity"
          activities={mockRecentActivities}
          className="lg:col-span-1"
        />
      </div>
    </div>
  );
};