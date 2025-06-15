import { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ChartCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  actions?: ReactNode;
}

export const ChartCard = ({
  title,
  description,
  children,
  className,
  actions
}: ChartCardProps) => {
  return (
    <Card className={cn("hover:shadow-elevation-medium transition-all duration-300", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="space-y-2">
          <CardTitle className="text-lg font-semibold tracking-tight">{title}</CardTitle>
          {description && (
            <CardDescription className="text-sm leading-relaxed">
              {description}
            </CardDescription>
          )}
        </div>
        {actions && (
          <div className="flex items-center space-x-2">
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