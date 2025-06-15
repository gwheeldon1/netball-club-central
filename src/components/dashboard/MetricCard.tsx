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
        return "bg-gradient-to-br from-emerald-500 to-emerald-600";
      case "purple":
        return "bg-gradient-to-br from-purple-500 to-purple-600";
      case "orange":
        return "bg-gradient-to-br from-orange-500 to-orange-600";
      case "red":
        return "bg-gradient-to-br from-red-500 to-red-600";
      default:
        return "gradient-primary";
    }
  };

  return (
    <Card className={cn("border-0 text-white overflow-hidden shadow-elevation-medium hover:shadow-elevation-high hover:scale-[1.02] transition-all duration-300", getGradientClass(), className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-3">
            <p className="text-sm font-medium text-white/80 uppercase tracking-wide">{title}</p>
            <p className="text-3xl font-bold tracking-tight">{value}</p>
            {subtitle && (
              <p className="text-sm text-white/75 font-medium">{subtitle}</p>
            )}
          </div>
          {icon && (
            <div className="h-12 w-12 text-white/80 p-3 bg-white/10 rounded-2xl backdrop-blur-sm">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};