
import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: ReactNode;
  trend?: "up" | "down" | "neutral";
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const StatCard = ({
  title,
  value,
  change,
  changeLabel,
  icon,
  trend,
  className,
  size = "md"
}: StatCardProps) => {
  const getTrendIcon = () => {
    if (trend === "up" || (change && change > 0)) return <TrendingUp className="h-3 w-3" />;
    if (trend === "down" || (change && change < 0)) return <TrendingDown className="h-3 w-3" />;
    return <Minus className="h-3 w-3" />;
  };

  const getTrendColor = () => {
    if (trend === "up" || (change && change > 0)) return "text-emerald-600 dark:text-emerald-400";
    if (trend === "down" || (change && change < 0)) return "text-red-600 dark:text-red-400";
    return "text-muted-foreground";
  };

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "p-4";
      case "lg":
        return "p-8";
      default:
        return "p-6";
    }
  };

  const getValueSize = () => {
    switch (size) {
      case "sm":
        return "text-xl";
      case "lg":
        return "text-4xl";
      default:
        return "text-2xl md:text-3xl";
    }
  };

  return (
    <Card className={cn(
      "hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50/30 dark:from-gray-950 dark:to-gray-900/30",
      className
    )}>
      <CardContent className={getSizeClasses()}>
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              {title}
            </p>
            <p className={cn("font-bold tracking-tight", getValueSize())}>
              {value}
            </p>
            {(change !== undefined || changeLabel) && (
              <div className="flex items-center space-x-2 text-sm">
                {change !== undefined && (
                  <div className={cn("flex items-center space-x-1 font-medium", getTrendColor())}>
                    {getTrendIcon()}
                    <span>
                      {change > 0 ? "+" : ""}{change}%
                    </span>
                  </div>
                )}
                {changeLabel && (
                  <span className="text-muted-foreground">{changeLabel}</span>
                )}
              </div>
            )}
          </div>
          {icon && (
            <div className="h-12 w-12 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary flex-shrink-0">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
