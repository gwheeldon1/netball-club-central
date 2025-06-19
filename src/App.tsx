
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/context/AuthContext';
import { ErrorBoundary } from '@/utils/errorBoundary';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Suspense } from 'react';
import {
  LazyTeamsPage as TeamsPage,
  LazyEventsPage as EventsPage,
  LazyChildrenPage as ChildrenPage,
  LazySettingsPage as SettingsPage,
  LazyUserProfilePage as UserProfilePage,
  LazyTeamDetailPage as TeamDetailPage,
  LazyEventDetailPage as EventDetailPage,
  LazyChildDetailPage as ChildDetailPage,
  LazyNewTeamPage as NewTeamPage,
  LazyEditTeamPage as EditTeamPage,
  LazyNewChildPage as NewChildPage,
  LazyRegistrationPage as RegistrationPage,
  LazyApprovalsPage as ApprovalsPage,
  LazySubscriptionSuccessPage as SubscriptionSuccessPage,
  PageLoadingFallback,
} from '@/components/LazyLoadedComponents';

// Critical pages loaded immediately (no lazy loading for login/auth)
import LoginPage from '@/pages/LoginPage';
import NotFound from '@/pages/NotFound';
import UnauthorizedPage from '@/pages/UnauthorizedPage';
import DesignSystemPage from '@/pages/DesignSystemPage';
import AnalyticsPage from '@/pages/AnalyticsPage';
import GroupsPage from '@/pages/GroupsPage';
import NewGroupPage from '@/pages/NewGroupPage';
import EditGroupPage from '@/pages/EditGroupPage';
import Index from '@/pages/Index';

// Lazy load heavy components that aren't immediately needed
import { lazy } from 'react';
const NewEventPage = lazy(() => import('@/pages/NewEventPage'));
const EditEventPage = lazy(() => import('@/pages/EditEventPage'));
import './App.css';

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" storageKey="netball-theme">
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegistrationPage />} />
            <Route path="/subscription-success" element={<SubscriptionSuccessPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            
            <Route path="/" element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            } />
            
            <Route path="/analytics" element={
              <ProtectedRoute requiredPermission="analytics.view.all">
                <AnalyticsPage />
              </ProtectedRoute>
            } />

            <Route path="/groups" element={
              <ProtectedRoute requiredPermission="groups.view.all">
                <GroupsPage />
              </ProtectedRoute>
            } />

            <Route path="/groups/new" element={
              <ProtectedRoute requiredPermission="groups.create">
                <NewGroupPage />
              </ProtectedRoute>
            } />

            <Route path="/groups/:id/edit" element={
              <ProtectedRoute requiredPermission="groups.edit.all">
                <EditGroupPage />
              </ProtectedRoute>
            } />
            
            <Route path="/teams" element={
              <ProtectedRoute>
                <Suspense fallback={<PageLoadingFallback />}>
                  <TeamsPage />
                </Suspense>
              </ProtectedRoute>
            } />
            
            <Route path="/teams/:id" element={
              <ProtectedRoute>
                <TeamDetailPage />
              </ProtectedRoute>
            } />
            
            <Route path="/teams/new" element={
              <ProtectedRoute requiredPermission="teams.create">
                <NewTeamPage />
              </ProtectedRoute>
            } />
            
            <Route path="/teams/:id/edit" element={
              <ProtectedRoute requiredPermission="teams.edit.all">
                <EditTeamPage />
              </ProtectedRoute>
            } />
            
            <Route path="/children" element={
              <ProtectedRoute allowedRoles={['parent']}>
                <ChildrenPage />
              </ProtectedRoute>
            } />
            
            <Route path="/children/new" element={
              <ProtectedRoute allowedRoles={['parent']}>
                <NewChildPage />
              </ProtectedRoute>
            } />
            
            <Route path="/children/:id" element={
              <ProtectedRoute>
                <ChildDetailPage />
              </ProtectedRoute>
            } />
            
            <Route path="/events" element={
              <ProtectedRoute>
                <EventsPage />
              </ProtectedRoute>
            } />
            
            <Route path="/events/new" element={
              <ProtectedRoute requiredPermission="events.create">
                <Suspense fallback={<PageLoadingFallback />}>
                  <NewEventPage />
                </Suspense>
              </ProtectedRoute>
            } />

            <Route path="/events/:id" element={
              <ProtectedRoute>
                <EventDetailPage />
              </ProtectedRoute>
            } />
            
            <Route path="/events/:id/edit" element={
              <ProtectedRoute requiredPermission="events.edit.all">
                <Suspense fallback={<PageLoadingFallback />}>
                  <EditEventPage />
                </Suspense>
              </ProtectedRoute>
            } />

            <Route path="/approvals" element={
              <ProtectedRoute requiredPermission="approvals.manage">
                <ApprovalsPage />
              </ProtectedRoute>
            } />
            
            <Route path="/profile" element={
              <ProtectedRoute>
                <UserProfilePage />
              </ProtectedRoute>
            } />
            
            <Route path="/settings" element={
              <ProtectedRoute requiredPermission="settings.manage">
                <SettingsPage />
              </ProtectedRoute>
            } />
            
            <Route path="/design" element={<DesignSystemPage />} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
        <Toaster position="top-right" />
      </AuthProvider>
    </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
