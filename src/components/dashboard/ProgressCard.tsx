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

  const getProgressColor = () => {
    switch (variant) {
      case "success":
        return "bg-green-500";
      case "warning":
        return "bg-yellow-500";
      case "destructive":
        return "bg-red-500";
      default:
        return "bg-primary";
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case "success":
        return "border-green-200 dark:border-green-800";
      case "warning":
        return "border-yellow-200 dark:border-yellow-800";
      case "destructive":
        return "border-red-200 dark:border-red-800";
      default:
        return "";
    }
  };

  return (
    <Card className={cn("transition-all duration-200 hover:shadow-md", getVariantStyles(), className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon && (
          <div className="h-4 w-4 text-muted-foreground">
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold">{value}</span>
          <span className="text-sm text-muted-foreground">of {maxValue}</span>
        </div>
        
        <div className="space-y-2">
          <Progress value={percentage} className="h-2" />
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{percentage}% complete</span>
            {label && <span className="font-medium">{label}</span>}
          </div>
        </div>
        
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  );
};