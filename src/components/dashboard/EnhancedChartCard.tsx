
import { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface EnhancedChartCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  actions?: ReactNode;
  fullHeight?: boolean;
}

export const EnhancedChartCard = ({
  title,
  description,
  children,
  className,
  actions,
  fullHeight = false
}: EnhancedChartCardProps) => {
  return (
    <Card className={cn(
      "border-0 bg-gradient-to-br from-white to-gray-50/30 dark:from-gray-950 dark:to-gray-900/30 shadow-lg hover:shadow-xl transition-all duration-300",
      fullHeight && "h-full",
      className
    )}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
        <div className="space-y-2 flex-1">
          <CardTitle className="text-lg md:text-xl font-semibold tracking-tight">
            {title}
          </CardTitle>
          {description && (
            <CardDescription className="text-sm leading-relaxed text-muted-foreground">
              {description}
            </CardDescription>
          )}
        </div>
        {actions && (
          <div className="flex items-center space-x-2 flex-shrink-0">
            {actions}
          </div>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        {children}
      </CardContent>
    </Card>
  );
};
