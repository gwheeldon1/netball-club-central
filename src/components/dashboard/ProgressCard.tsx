import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface ProgressCardProps {
  title: string;
  value: number;
  maxValue: number;
  label?: string;
  description?: string;
  icon?: ReactNode;
  variant?: "default" | "success" | "warning" | "destructive";
  className?: string;
}

export const ProgressCard = ({
  title,
  value,
  maxValue,
  label,
  description,
  icon,
  variant = "default",
  className
}: ProgressCardProps) => {
  const percentage = Math.round((value / maxValue) * 100);

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
          iconBg: "bg-primary/10",
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
      <CardContent className="space-y-4">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight">{value}</span>
          <span className="text-sm text-muted-foreground font-medium">of {maxValue}</span>
        </div>
        
        <div className="space-y-3">
          <Progress value={percentage} className="h-2.5" />
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground font-medium">{percentage}% complete</span>
            {label && <span className="font-semibold">{label}</span>}
          </div>
        </div>
        
        {description && (
          <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        )}
      </CardContent>
    </Card>
  );
};