import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  gradient?: "blue" | "green" | "purple" | "orange" | "red";
  className?: string;
}

export const MetricCard = ({
  title,
  value,
  subtitle,
  icon,
  gradient = "blue",
  className
}: MetricCardProps) => {
  const getGradientClass = () => {
    switch (gradient) {
      case "blue":
        return "bg-gradient-to-br from-blue-500 to-blue-600";
      case "green":
        return "bg-gradient-to-br from-green-500 to-green-600";
      case "purple":
        return "bg-gradient-to-br from-purple-500 to-purple-600";
      case "orange":
        return "bg-gradient-to-br from-orange-500 to-orange-600";
      case "red":
        return "bg-gradient-to-br from-red-500 to-red-600";
      default:
        return "bg-gradient-to-br from-primary to-primary/80";
    }
  };

  return (
    <Card className={cn("border-0 text-white overflow-hidden", getGradientClass(), className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-white/80">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
            {subtitle && (
              <p className="text-xs text-white/70">{subtitle}</p>
            )}
          </div>
          {icon && (
            <div className="h-12 w-12 text-white/80">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};