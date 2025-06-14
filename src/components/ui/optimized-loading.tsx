import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface OptimizedLoadingProps {
  variant?: 'cards' | 'table' | 'list' | 'form' | 'dashboard';
  count?: number;
  className?: string;
}

export function OptimizedLoading({ 
  variant = 'cards', 
  count = 3,
  className 
}: OptimizedLoadingProps) {
  const renderContent = () => {
    switch (variant) {
      case 'cards':
        return Array.from({ length: count }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <div className="flex gap-2 pt-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-20" />
              </div>
            </CardContent>
          </Card>
        ));

      case 'table':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-10 w-32" />
            </div>
            <div className="border rounded-lg">
              <div className="border-b p-4">
                <div className="flex gap-4">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
              {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="border-b last:border-b-0 p-4">
                  <div className="flex gap-4">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'list':
        return (
          <div className="space-y-4">
            {Array.from({ length: count }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-8 w-20" />
              </div>
            ))}
          </div>
        );

      case 'form':
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-24 w-full" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-20" />
            </div>
          </div>
        );

      case 'dashboard':
        return (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
              <div>
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-32 mt-2" />
              </div>
              <Skeleton className="h-10 w-32" />
            </div>
            
            {/* Stats cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="h-8 w-16 mt-2" />
                    <Skeleton className="h-3 w-20 mt-1" />
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {/* Main content grid */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-40" />
                </CardHeader>
                <CardContent className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2 mt-1" />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-48 w-full" />
                </CardContent>
              </Card>
            </div>
          </div>
        );

      default:
        return <Skeleton className="h-32 w-full" />;
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {renderContent()}
    </div>
  );
}

// Optimized component for specific loading scenarios
export function TableLoading({ rows = 5 }: { rows?: number }) {
  return <OptimizedLoading variant="table" count={rows} />;
}

export function CardGridLoading({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <OptimizedLoading variant="cards" count={count} />
    </div>
  );
}

export function DashboardLoading() {
  return <OptimizedLoading variant="dashboard" />;
}

export function FormLoading() {
  return <OptimizedLoading variant="form" />;
}