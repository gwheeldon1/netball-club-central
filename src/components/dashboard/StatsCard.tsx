import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: ReactNode;
  description?: string;
  className?: string;
  variant?: "default" | "success" | "warning" | "destructive";
}

export const StatsCard = ({
  title,
  value,
  change,
  changeLabel,
  icon,
  description,
  className,
  variant = "default"
}: StatsCardProps) => {
  const getChangeIcon = () => {
    if (change === undefined) return null;
    if (change > 0) return <TrendingUp className="h-3 w-3" />;
    if (change < 0) return <TrendingDown className="h-3 w-3" />;
    return <Minus className="h-3 w-3" />;
  };

  const getChangeColor = () => {
    if (change === undefined) return "";
    if (change > 0) return "text-emerald-600 dark:text-emerald-400";
    if (change < 0) return "text-red-600 dark:text-red-400";
    return "text-muted-foreground";
  };

  const getVariantStyles = () => {
    switch (variant) {
      case "success":
        return {
          cardStyle: "border-emerald-200/50 bg-emerald-50/50 dark:border-emerald-800/50 dark:bg-emerald-950/20",
          iconBg: "bg-emerald-100 dark:bg-emerald-950/50",
          iconColor: "text-emerald-600 dark:text-emerald-400"
        };
      case "warning":
        return {
          cardStyle: "border-amber-200/50 bg-amber-50/50 dark:border-amber-800/50 dark:bg-amber-950/20",
          iconBg: "bg-amber-100 dark:bg-amber-950/50",
          iconColor: "text-amber-600 dark:text-amber-400"
        };
      case "destructive":
        return {
          cardStyle: "border-red-200/50 bg-red-50/50 dark:border-red-800/50 dark:bg-red-950/20",
          iconBg: "bg-red-100 dark:bg-red-950/50",
          iconColor: "text-red-600 dark:text-red-400"
        };
      default:
        return {
          cardStyle: "",
          iconBg: "bg-secondary",
          iconColor: "text-primary"
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <Card className={cn("hover:scale-[1.02] hover:shadow-elevation-medium transition-all duration-300", styles.cardStyle, className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          {title}
        </CardTitle>
        {icon && (
          <div className={cn("p-2.5 rounded-xl", styles.iconBg)}>
            <div className={cn("h-4 w-4", styles.iconColor)}>
              {icon}
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tracking-tight">{value}</div>
        {(change !== undefined || description) && (
          <div className="flex items-center space-x-2 text-sm mt-2">
            {change !== undefined && (
              <div className={cn("flex items-center space-x-1 font-medium", getChangeColor())}>
                {getChangeIcon()}
                <span>
                  {change > 0 ? "+" : ""}{change}%
                </span>
              </div>
            )}
            {changeLabel && (
              <span className="text-muted-foreground">{changeLabel}</span>
            )}
            {description && (
              <span className="text-muted-foreground">{description}</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};