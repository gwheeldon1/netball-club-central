
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MoreHorizontal, Download, Maximize2, Filter } from "lucide-react";
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  PieChart,
  Pie,
  Cell,
  ComposedChart
} from "recharts";
import { useState } from "react";

const attendanceData = [
  { month: "Jan", actual: 82, target: 85, sessions: 24 },
  { month: "Feb", actual: 79, target: 85, sessions: 22 },
  { month: "Mar", actual: 88, target: 85, sessions: 28 },
  { month: "Apr", actual: 91, target: 85, sessions: 30 },
  { month: "May", actual: 87, target: 85, sessions: 26 },
  { month: "Jun", actual: 93, target: 85, sessions: 32 }
];

const revenueData = [
  { month: "Jan", revenue: 4200, subscriptions: 230, oneTime: 450 },
  { month: "Feb", revenue: 4100, subscriptions: 225, oneTime: 380 },
  { month: "Mar", revenue: 4600, subscriptions: 240, oneTime: 520 },
  { month: "Apr", revenue: 4890, subscriptions: 247, oneTime: 640 },
  { month: "May", revenue: 5100, subscriptions: 252, oneTime: 580 },
  { month: "Jun", revenue: 5340, subscriptions: 261, oneTime: 720 }
];

const teamPerformanceData = [
  { team: "Under 8s", attendance: 94, satisfaction: 4.8, retention: 96 },
  { team: "Under 10s", attendance: 87, satisfaction: 4.6, retention: 92 },
  { team: "Under 12s", attendance: 91, satisfaction: 4.7, retention: 94 },
  { team: "Under 14s", attendance: 85, satisfaction: 4.5, retention: 89 },
  { team: "Under 16s", attendance: 88, satisfaction: 4.6, retention: 91 },
  { team: "Seniors", attendance: 82, satisfaction: 4.4, retention: 85 }
];

const eventTypeData = [
  { name: "Training", value: 65, color: "#3b82f6" },
  { name: "Matches", value: 25, color: "#ef4444" },
  { name: "Tournaments", value: 7, color: "#10b981" },
  { name: "Social", value: 3, color: "#f59e0b" }
];

const ChartCard = ({ 
  title, 
  description, 
  children, 
  actions,
  fullHeight = false 
}: { 
  title: string; 
  description?: string; 
  children: React.ReactNode; 
  actions?: React.ReactNode;
  fullHeight?: boolean;
}) => (
  <Card className={`border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/30 dark:from-gray-950 dark:to-gray-900/30 ${fullHeight ? 'h-full' : ''}`}>
    <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
      <div className="space-y-2 flex-1">
        <CardTitle className="text-lg font-semibold tracking-tight">{title}</CardTitle>
        {description && (
          <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        )}
      </div>
      <div className="flex items-center space-x-2">
        {actions}
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>
    </CardHeader>
    <CardContent className="pt-0">
      {children}
    </CardContent>
  </Card>
);

export const AdvancedCharts = () => {
  const [attendancePeriod, setAttendancePeriod] = useState("6m");
  const [revenuePeriod, setRevenuePeriod] = useState("6m");

  return (
    <div className="space-y-8">
      {/* Attendance Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChartCard
            title="Attendance Analytics"
            description="Track attendance trends vs targets with session volume"
            actions={
              <Select value={attendancePeriod} onValueChange={setAttendancePeriod}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3m">3M</SelectItem>
                  <SelectItem value="6m">6M</SelectItem>
                  <SelectItem value="1y">1Y</SelectItem>
                </SelectContent>
              </Select>
            }
            fullHeight
          >
            <ResponsiveContainer width="100%" height={320}>
              <ComposedChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
                <XAxis dataKey="month" className="text-muted-foreground" fontSize={12} />
                <YAxis yAxisId="left" className="text-muted-foreground" fontSize={12} />
                <YAxis yAxisId="right" orientation="right" className="text-muted-foreground" fontSize={12} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "12px",
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)"
                  }}
                />
                <Legend />
                <Bar yAxisId="right" dataKey="sessions" fill="hsl(var(--muted))" name="Sessions" radius={[4, 4, 0, 0]} />
                <Line yAxisId="left" type="monotone" dataKey="actual" stroke="hsl(171, 75%, 41%)" strokeWidth={3} name="Actual %" dot={{ fill: "hsl(171, 75%, 41%)", strokeWidth: 2, r: 4 }} />
                <Line yAxisId="left" type="monotone" dataKey="target" stroke="hsl(var(--muted-foreground))" strokeWidth={2} strokeDasharray="5 5" name="Target %" />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <ChartCard
          title="Event Distribution"
          description="Breakdown of event types this period"
          fullHeight
        >
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={eventTypeData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                innerRadius={40}
                paddingAngle={5}
                dataKey="value"
              >
                {eventTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "12px"
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 mt-4">
            {eventTypeData.map((item) => (
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
        </ChartCard>
      </div>

      {/* Revenue Analytics */}
      <ChartCard
        title="Revenue Analytics"
        description="Track revenue streams and growth patterns"
        actions={
          <>
            <Select value={revenuePeriod} onValueChange={setRevenuePeriod}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3m">3M</SelectItem>
                <SelectItem value="6m">6M</SelectItem>
                <SelectItem value="1y">1Y</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4" />
            </Button>
          </>
        }
      >
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
            <XAxis dataKey="month" className="text-muted-foreground" fontSize={12} />
            <YAxis className="text-muted-foreground" fontSize={12} />
            <Tooltip 
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "12px",
                boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)"
              }}
              formatter={(value, name) => [`£${value}`, name === 'subscriptions' ? 'Subscriptions' : name === 'oneTime' ? 'One-time' : 'Total Revenue']}
            />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="revenue" 
              stackId="1" 
              stroke="hsl(171, 75%, 41%)" 
              fill="hsl(171, 75%, 41%)" 
              fillOpacity={0.3}
              name="Total Revenue"
            />
            <Area 
              type="monotone" 
              dataKey="subscriptions" 
              stackId="2" 
              stroke="hsl(200, 95%, 50%)" 
              fill="hsl(200, 95%, 50%)" 
              fillOpacity={0.3}
              name="Subscriptions"
            />
            <Area 
              type="monotone" 
              dataKey="oneTime" 
              stackId="3" 
              stroke="hsl(52, 100%, 50%)" 
              fill="hsl(52, 100%, 50%)" 
              fillOpacity={0.3}
              name="One-time"
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Team Performance Comparison */}
      <ChartCard
        title="Team Performance Matrix"
        description="Compare attendance, satisfaction, and retention across all teams"
        actions={
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        }
      >
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={teamPerformanceData} margin={{ bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
            <XAxis 
              dataKey="team" 
              className="text-muted-foreground" 
              fontSize={12}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis className="text-muted-foreground" fontSize={12} />
            <Tooltip 
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "12px",
                boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)"
              }}
            />
            <Legend />
            <Bar dataKey="attendance" fill="hsl(171, 75%, 41%)" name="Attendance %" radius={[4, 4, 0, 0]} />
            <Bar dataKey="retention" fill="hsl(200, 95%, 50%)" name="Retention %" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
};
