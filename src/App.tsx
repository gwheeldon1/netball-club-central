
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Dashboard from '@/pages/Dashboard';
import LoginPage from '@/pages/LoginPage';
import TeamsPage from '@/pages/TeamsPage';
import TeamDetailPage from '@/pages/TeamDetailPage';
import ChildrenPage from '@/pages/ChildrenPage';
import ChildDetailPage from '@/pages/ChildDetailPage';
import NewChildPage from '@/pages/NewChildPage';
import EventsPage from '@/pages/EventsPage';
import EventDetailPage from '@/pages/EventDetailPage';
import ApprovalsPage from '@/pages/ApprovalsPage';
import NotFound from '@/pages/NotFound';
import UnauthorizedPage from '@/pages/UnauthorizedPage';
import { NetworkStatus } from '@/components/NetworkStatus';
import './App.css';

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="netball-theme">
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
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
            
            <Route path="*" element={<NotFound />} />
          </Routes>
          <NetworkStatus />
        </Router>
        <Toaster position="top-right" />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
