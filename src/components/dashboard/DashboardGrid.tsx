import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DashboardGridProps {
  children: ReactNode;
  className?: string;
  cols?: 1 | 2 | 3 | 4 | 6 | 12;
  gap?: "sm" | "md" | "lg";
}

export const DashboardGrid = ({
  children,
  className,
  cols = 4,
  gap = "md"
}: DashboardGridProps) => {
  const getGridCols = () => {
    switch (cols) {
      case 1:
        return "grid-cols-1";
      case 2:
        return "grid-cols-1 md:grid-cols-2";
      case 3:
        return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
      case 4:
        return "grid-cols-1 md:grid-cols-2 lg:grid-cols-4";
      case 6:
        return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6";
      case 12:
        return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6";
      default:
        return "grid-cols-1 md:grid-cols-2 lg:grid-cols-4";
    }
  };

  const getGap = () => {
    switch (gap) {
      case "sm":
        return "gap-4";
      case "md":
        return "gap-6";
      case "lg":
        return "gap-8";
      default:
        return "gap-6";
    }
  };

  return (
    <div className={cn("grid", getGridCols(), getGap(), className)}>
      {children}
    </div>
  );
};