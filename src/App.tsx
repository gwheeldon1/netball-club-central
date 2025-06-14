
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/context/AuthContext';
import { ErrorBoundary } from '@/utils/errorBoundary';
import ProtectedRoute from '@/components/ProtectedRoute';
import Dashboard from '@/pages/Dashboard';
import LoginPage from '@/pages/LoginPage';
import RegistrationPage from '@/pages/RegistrationPage';
import TeamsPage from '@/pages/TeamsPage';
import TeamDetailPage from '@/pages/TeamDetailPage';
import EditTeamPage from '@/pages/EditTeamPage';
import ChildrenPage from '@/pages/ChildrenPage';
import ChildDetailPage from '@/pages/ChildDetailPage';
import NewChildPage from '@/pages/NewChildPage';
import NewTeamPage from '@/pages/NewTeamPage';
import EventsPage from '@/pages/EventsPage';
import EventDetailPage from '@/pages/EventDetailPage';
import ApprovalsPage from '@/pages/ApprovalsPage';
import UserProfilePage from '@/pages/UserProfilePage';
import SettingsPage from '@/pages/SettingsPage';
import NotFound from '@/pages/NotFound';
import UnauthorizedPage from '@/pages/UnauthorizedPage';
import DesignSystemPage from '@/pages/DesignSystemPage';
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
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            
            {/* Protected routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/teams" element={
              <ProtectedRoute>
                <TeamsPage />
              </ProtectedRoute>
            } />
            
            <Route path="/teams/:id" element={
              <ProtectedRoute>
                <TeamDetailPage />
              </ProtectedRoute>
            } />
            
            <Route path="/teams/new" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <NewTeamPage />
              </ProtectedRoute>
            } />
            
            <Route path="/teams/:id/edit" element={
              <ProtectedRoute allowedRoles={['admin']}>
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
            
            <Route path="/events/:id" element={
              <ProtectedRoute>
                <EventDetailPage />
              </ProtectedRoute>
            } />
            
            <Route path="/approvals" element={
              <ProtectedRoute allowedRoles={['admin', 'coach', 'manager']}>
                <ApprovalsPage />
              </ProtectedRoute>
            } />
            
            <Route path="/profile" element={
              <ProtectedRoute>
                <UserProfilePage />
              </ProtectedRoute>
            } />
            
            <Route path="/settings" element={
              <ProtectedRoute allowedRoles={['admin']}>
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
