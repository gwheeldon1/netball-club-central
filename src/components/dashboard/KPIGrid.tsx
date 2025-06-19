
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface KPIGridProps {
  children: ReactNode;
  cols?: 2 | 3 | 4;
  className?: string;
}

export const KPIGrid = ({ children, cols = 4, className }: KPIGridProps) => {
  const getGridCols = () => {
    switch (cols) {
      case 2:
        return "grid-cols-1 sm:grid-cols-2";
      case 3:
        return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
      case 4:
        return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";
      default:
        return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";
    }
  };

  return (
    <div className={cn(
      "grid gap-4 sm:gap-6",
      getGridCols(),
      className
    )}>
      {children}
    </div>
  );
};
