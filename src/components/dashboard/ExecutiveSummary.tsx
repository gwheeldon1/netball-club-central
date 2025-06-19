
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExecutiveSummaryProps {
  period: string;
}

export const ExecutiveSummary = ({ period }: ExecutiveSummaryProps) => {
  const insights = [
    {
      type: "success",
      icon: CheckCircle,
      title: "Strong Attendance Growth",
      description: "Attendance rates increased 12% this month with consistent participation across all age groups.",
      action: "Continue current engagement strategies"
    },
    {
      type: "warning", 
      icon: AlertTriangle,
      title: "Payment Collection Alert",
      description: "3 overdue subscriptions requiring follow-up. Total outstanding: £240.",
      action: "Review payment collection process"
    },
    {
      type: "insight",
      icon: TrendingUp,
      title: "Peak Training Days",
      description: "Tuesday and Thursday sessions show highest engagement. Consider adding capacity.",
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
            {period}
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
