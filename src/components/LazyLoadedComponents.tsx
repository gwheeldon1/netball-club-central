
import { lazy, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

// Loading fallback components
export const PageLoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="space-y-4 w-full max-w-md p-4">
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  </div>
);

export const DashboardLoadingFallback = () => (
  <div className="min-h-screen bg-background">
    <div className="container mx-auto p-4 space-y-6">
      <Skeleton className="h-12 w-64" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    </div>
  </div>
);

// Lazy loaded components
export const LazyDashboard = lazy(() => import('@/pages/Dashboard'));
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
