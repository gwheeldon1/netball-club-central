
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Users, Calendar, Trophy, DollarSign, Activity, UserCheck, AlertCircle, Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string;
  change: number;
  changeLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  trend: "up" | "down" | "neutral";
  target?: string;
  status?: "on-track" | "at-risk" | "exceeded";
}

const MetricCard = ({ title, value, change, changeLabel, icon: Icon, trend, target, status }: MetricCardProps) => {
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

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/30 dark:from-gray-950 dark:to-gray-900/30 hover:shadow-xl transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2">
              {title}
            </p>
            <div className="flex items-baseline space-x-2">
              <p className="text-3xl font-bold tracking-tight">{value}</p>
              {target && (
                <span className="text-sm text-muted-foreground">/ {target}</span>
              )}
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
          {status && (
            <Badge variant="secondary" className={cn("text-xs", getStatusColor())}>
              {status === "exceeded" ? "Exceeded" : status === "at-risk" ? "At Risk" : "On Track"}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export const MetricsOverview = () => {
  const metrics = [
    {
      title: "Active Players",
      value: "247",
      change: 8.2,
      changeLabel: "vs last month",
      icon: Users,
      trend: "up" as const,
      target: "250",
      status: "on-track" as const
    },
    {
      title: "Monthly Revenue",
      value: "£4,890",
      change: 12.5,
      changeLabel: "vs last month",
      icon: DollarSign,
      trend: "up" as const,
      target: "£5,000",
      status: "exceeded" as const
    },
    {
      title: "Attendance Rate",
      value: "87%",
      change: 3.1,
      changeLabel: "vs last month",
      icon: UserCheck,
      trend: "up" as const,
      target: "85%",
      status: "exceeded" as const
    },
    {
      title: "Events This Month",
      value: "32",
      change: -5.2,
      changeLabel: "vs last month",
      icon: Calendar,
      trend: "down" as const,
      target: "35",
      status: "at-risk" as const
    },
    {
      title: "Teams Active",
      value: "8",
      change: 0,
      changeLabel: "no change",
      icon: Trophy,
      trend: "neutral" as const,
      status: "on-track" as const
    },
    {
      title: "Avg Session Size",
      value: "18",
      change: 5.9,
      changeLabel: "vs last month",
      icon: Activity,
      trend: "up" as const,
      target: "20",
      status: "on-track" as const
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Key Performance Metrics</h2>
          <p className="text-muted-foreground">Real-time insights into your club's performance</p>
        </div>
        <Button variant="outline" size="sm">
          <Target className="h-4 w-4 mr-2" />
          Set Targets
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>
    </div>
  );
};
