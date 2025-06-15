import { lazy, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { FormSkeleton } from '@/components/ui/FormSkeleton';
import { CardSkeleton } from '@/components/ui/loading-skeleton';

// Lazy loaded page components (Dashboard removed - now imported directly)
export const LazyTeamsPage = lazy(() => import('@/pages/TeamsPage'));
export const LazyEventsPage = lazy(() => import('@/pages/EventsPage'));
export const LazyChildrenPage = lazy(() => import('@/pages/ChildrenPage'));
export const LazySettingsPage = lazy(() => import('@/pages/SettingsPage'));
export const LazyUserProfilePage = lazy(() => import('@/pages/UserProfilePage'));
export const LazyTeamDetailPage = lazy(() => import('@/pages/TeamDetailPage'));
export const LazyEventDetailPage = lazy(() => import('@/pages/EventDetailPage'));
export const LazyChildDetailPage = lazy(() => import('@/pages/ChildDetailPage'));
export const LazyNewTeamPage = lazy(() => import('@/pages/NewTeamPage'));
export const LazyEditTeamPage = lazy(() => import('@/pages/EditTeamPage'));
export const LazyNewChildPage = lazy(() => import('@/pages/NewChildPage'));
export const LazyRegistrationPage = lazy(() => import('@/pages/RegistrationPage'));
export const LazyApprovalsPage = lazy(() => import('@/pages/ApprovalsPage'));
export const LazySubscriptionSuccessPage = lazy(() => import('@/pages/SubscriptionSuccessPage'));

// Lazy loaded complex components
export const LazyPlayerPerformanceDashboard = lazy(() => import('@/components/PlayerPerformanceDashboard'));
export const LazyAnalyticsDashboard = lazy(() => import('@/components/AnalyticsDashboard'));
export const LazyAdminUserManagement = lazy(() => import('@/components/AdminUserManagement'));
export const LazySystemMonitoring = lazy(() => import('@/components/SystemMonitoring'));
export const LazyCalendarView = lazy(() => import('@/components/CalendarView'));

// Loading fallbacks for different component types
export const PageLoadingFallback = () => (
  <div className="container mx-auto p-6 space-y-6">
    <Skeleton className="h-8 w-48" />
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <CardSkeleton />
      <CardSkeleton />
      <CardSkeleton />
    </div>
  </div>
);

export const FormLoadingFallback = () => (
  <div className="max-w-2xl mx-auto p-6">
    <Skeleton className="h-8 w-32 mb-6" />
    <FormSkeleton fields={4} />
  </div>
);

export const DashboardLoadingFallback = () => (
  <div className="container mx-auto p-6 space-y-6">
    <Skeleton className="h-10 w-64" />
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      ))}
    </div>
    <div className="grid gap-6 md:grid-cols-2">
      <CardSkeleton />
      <CardSkeleton />
    </div>
  </div>
);

// HOC for wrapping components with Suspense
export function withSuspense<T extends object>(
  Component: React.ComponentType<T>,
  fallback?: React.ReactNode
) {
  return function WrappedComponent(props: T) {
    return (
      <Suspense fallback={fallback || <PageLoadingFallback />}>
        <Component {...props} />
      </Suspense>
    );
  };
}
