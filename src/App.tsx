
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/context/AuthContext';
import { AppErrorBoundary } from '@/components/AppErrorBoundary';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Suspense } from 'react';
import { PageLoadingFallback } from '@/components/LazyLoadedComponents';

// Critical pages loaded immediately
import LoginPage from '@/pages/LoginPage';
import NotFound from '@/pages/NotFound';
import UnauthorizedPage from '@/pages/UnauthorizedPage';
import DesignSystemPage from '@/pages/DesignSystemPage';
import AnalyticsPage from '@/pages/AnalyticsPage';
import GroupsPage from '@/pages/GroupsPage';
import NewGroupPage from '@/pages/NewGroupPage';
import EditGroupPage from '@/pages/EditGroupPage';
import Index from '@/pages/Index';

// Lazy load all other components to avoid circular dependencies
import { lazy } from 'react';
const TeamsPage = lazy(() => import('@/pages/TeamsPage'));
const EventsPage = lazy(() => import('@/pages/EventsPage'));
const ChildrenPage = lazy(() => import('@/pages/ChildrenPage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));
const UserProfilePage = lazy(() => import('@/pages/UserProfilePage'));
const TeamDetailPage = lazy(() => import('@/pages/TeamDetailPage'));
const EventDetailPage = lazy(() => import('@/pages/EventDetailPage'));
const ChildDetailPage = lazy(() => import('@/pages/ChildDetailPage'));
const NewTeamPage = lazy(() => import('@/pages/NewTeamPage'));
const EditTeamPage = lazy(() => import('@/pages/EditTeamPage'));
const NewChildPage = lazy(() => import('@/pages/NewChildPage'));
const RegistrationPage = lazy(() => import('@/pages/RegistrationPage'));
const ApprovalsPage = lazy(() => import('@/pages/ApprovalsPage'));
const SubscriptionSuccessPage = lazy(() => import('@/pages/SubscriptionSuccessPage'));
const NewEventPage = lazy(() => import('@/pages/NewEventPage'));
const EditEventPage = lazy(() => import('@/pages/EditEventPage'));

import './App.css';

function App() {
  console.log('App component rendering');

  return (
    <AppErrorBoundary>
      <ThemeProvider defaultTheme="light" storageKey="netball-theme">
        <AuthProvider>
          <Router>
            <div className="min-h-screen w-full">
              <Routes>
                <Route path="/login" element={
                  <ProtectedRoute requireAuth={false}>
                    <LoginPage />
                  </ProtectedRoute>
                } />
                <Route path="/register" element={
                  <ProtectedRoute requireAuth={false}>
                    <Suspense fallback={<PageLoadingFallback />}>
                      <RegistrationPage />
                    </Suspense>
                  </ProtectedRoute>
                } />
                <Route path="/subscription-success" element={
                  <Suspense fallback={<PageLoadingFallback />}>
                    <SubscriptionSuccessPage />
                  </Suspense>
                } />
                <Route path="/unauthorized" element={<UnauthorizedPage />} />
                
                <Route path="/" element={
                  <ProtectedRoute>
                    <Index />
                  </ProtectedRoute>
                } />
                
                <Route path="/analytics" element={
                  <ProtectedRoute>
                    <AnalyticsPage />
                  </ProtectedRoute>
                } />

                <Route path="/groups" element={
                  <ProtectedRoute>
                    <GroupsPage />
                  </ProtectedRoute>
                } />

                <Route path="/groups/new" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <NewGroupPage />
                  </ProtectedRoute>
                } />

                <Route path="/groups/:id/edit" element={
                  <ProtectedRoute allowedRoles={['admin']}>
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
                    <Suspense fallback={<PageLoadingFallback />}>
                      <TeamDetailPage />
                    </Suspense>
                  </ProtectedRoute>
                } />
                
                <Route path="/teams/new" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <Suspense fallback={<PageLoadingFallback />}>
                      <NewTeamPage />
                    </Suspense>
                  </ProtectedRoute>
                } />
                
                <Route path="/teams/:id/edit" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <Suspense fallback={<PageLoadingFallback />}>
                      <EditTeamPage />
                    </Suspense>
                  </ProtectedRoute>
                } />
                
                <Route path="/children" element={
                  <ProtectedRoute allowedRoles={['parent']}>
                    <Suspense fallback={<PageLoadingFallback />}>
                      <ChildrenPage />
                    </Suspense>
                  </ProtectedRoute>
                } />
                
                <Route path="/children/new" element={
                  <ProtectedRoute allowedRoles={['parent']}>
                    <Suspense fallback={<PageLoadingFallback />}>
                      <NewChildPage />
                    </Suspense>
                  </ProtectedRoute>
                } />
                
                <Route path="/children/:id" element={
                  <ProtectedRoute>
                    <Suspense fallback={<PageLoadingFallback />}>
                      <ChildDetailPage />
                    </Suspense>
                  </ProtectedRoute>
                } />
                
                <Route path="/events" element={
                  <ProtectedRoute>
                    <Suspense fallback={<PageLoadingFallback />}>
                      <EventsPage />
                    </Suspense>
                  </ProtectedRoute>
                } />
                
                <Route path="/events/new" element={
                  <ProtectedRoute allowedRoles={['admin', 'coach', 'manager']}>
                    <Suspense fallback={<PageLoadingFallback />}>
                      <NewEventPage />
                    </Suspense>
                  </ProtectedRoute>
                } />

                <Route path="/events/:id" element={
                  <ProtectedRoute>
                    <Suspense fallback={<PageLoadingFallback />}>
                      <EventDetailPage />
                    </Suspense>
                  </ProtectedRoute>
                } />
                
                <Route path="/events/:id/edit" element={
                  <ProtectedRoute allowedRoles={['admin', 'coach', 'manager']}>
                    <Suspense fallback={<PageLoadingFallback />}>
                      <EditEventPage />
                    </Suspense>
                  </ProtectedRoute>
                } />

                <Route path="/approvals" element={
                  <ProtectedRoute allowedRoles={['admin', 'coach', 'manager']}>
                    <Suspense fallback={<PageLoadingFallback />}>
                      <ApprovalsPage />
                    </Suspense>
                  </ProtectedRoute>
                } />
                
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Suspense fallback={<PageLoadingFallback />}>
                      <UserProfilePage />
                    </Suspense>
                  </ProtectedRoute>
                } />
                
                <Route path="/settings" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <Suspense fallback={<PageLoadingFallback />}>
                      <SettingsPage />
                    </Suspense>
                  </ProtectedRoute>
                } />
                
                <Route path="/design" element={<DesignSystemPage />} />
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </Router>
          <Toaster position="top-right" />
        </AuthProvider>
      </ThemeProvider>
    </AppErrorBoundary>
  );
}

export default App;
