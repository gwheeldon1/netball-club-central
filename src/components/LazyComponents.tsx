import React, { Suspense } from 'react';
import { ErrorBoundary } from '@/utils/errorBoundary';
import { Skeleton } from '@/components/ui/loading-skeleton';

// Lazy load all page components for code splitting
export const Dashboard = React.lazy(() => import('@/pages/Dashboard'));
export const LoginPage = React.lazy(() => import('@/pages/LoginPage'));
export const RegistrationPage = React.lazy(() => import('@/pages/RegistrationPage'));
export const TeamsPage = React.lazy(() => import('@/pages/TeamsPage'));
export const TeamDetailPage = React.lazy(() => import('@/pages/TeamDetailPage'));
export const EditTeamPage = React.lazy(() => import('@/pages/EditTeamPage'));
export const ChildrenPage = React.lazy(() => import('@/pages/ChildrenPage'));
export const ChildDetailPage = React.lazy(() => import('@/pages/ChildDetailPage'));
export const NewChildPage = React.lazy(() => import('@/pages/NewChildPage'));
export const NewTeamPage = React.lazy(() => import('@/pages/NewTeamPage'));
export const EventsPage = React.lazy(() => import('@/pages/EventsPage'));
export const EventDetailPage = React.lazy(() => import('@/pages/EventDetailPage'));
export const ApprovalsPage = React.lazy(() => import('@/pages/ApprovalsPage'));
export const UserProfilePage = React.lazy(() => import('@/pages/UserProfilePage'));
export const SettingsPage = React.lazy(() => import('@/pages/SettingsPage'));
export const NotFound = React.lazy(() => import('@/pages/NotFound'));
export const UnauthorizedPage = React.lazy(() => import('@/pages/UnauthorizedPage'));
export const DesignSystemPage = React.lazy(() => import('@/pages/DesignSystemPage'));

// Page loading fallback component
export function PageLoadingFallback() {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <Skeleton variant="rectangular" width={120} height={24} />
          <div className="ml-auto flex items-center space-x-4">
            <Skeleton variant="circular" width={32} height={32} />
          </div>
        </div>
      </div>
      <div className="container py-6">
        <div className="space-y-6">
          <Skeleton variant="text" width="40%" height={32} />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-lg border p-6 space-y-4">
                <Skeleton variant="text" width="60%" height={20} />
                <Skeleton variant="text" lines={2} />
                <div className="flex space-x-2">
                  <Skeleton variant="rounded" width={80} height={32} />
                  <Skeleton variant="rounded" width={80} height={32} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// HOC for wrapping lazy components with error boundaries and loading states
export function withLazyLoading<P extends object>(
  LazyComponent: React.LazyExoticComponent<React.ComponentType<P>>,
  fallback?: React.ComponentType
) {
  return function LazyLoadedComponent(props: P) {
    const FallbackComponent = fallback || PageLoadingFallback;
    
    return (
      <ErrorBoundary>
        <Suspense fallback={<FallbackComponent />}>
          <LazyComponent {...props as any} />
        </Suspense>
      </ErrorBoundary>
    );
  };
}