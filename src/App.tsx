
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'sonner';

// Page imports
import Dashboard from './pages/Dashboard';
import TeamsPage from './pages/TeamsPage';
import NewTeamPage from "@/pages/NewTeamPage";
import TeamDetailPage from "@/pages/TeamDetailPage";
import EventsPage from './pages/EventsPage';
import NewEventPage from "@/pages/NewEventPage";
import EventDetailPage from "@/pages/EventDetailPage";
import AnalyticsPage from './pages/AnalyticsPage';
import EnhancedAnalyticsPage from './pages/EnhancedAnalyticsPage';
import ModernAnalyticsPage from './pages/ModernAnalyticsPage';
import AdminDashboard from "@/pages/AdminDashboard";
import SettingsPage from "@/pages/SettingsPage";
import UnauthorizedPage from "@/pages/UnauthorizedPage";
import PlayersPage from "@/pages/PlayersPage";
import UserProfilePage from "@/pages/UserProfilePage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-background text-foreground">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/teams" element={<TeamsPage />} />
              <Route path="/teams/new" element={<NewTeamPage />} />
              <Route path="/teams/:id" element={<TeamDetailPage />} />
              <Route path="/events" element={<EventsPage />} />
              <Route path="/events/new" element={<NewEventPage />} />
              <Route path="/events/:id" element={<EventDetailPage />} />
              <Route path="/players" element={<PlayersPage />} />
              <Route path="/analytics" element={<ModernAnalyticsPage />} />
              <Route path="/analytics/enhanced" element={<EnhancedAnalyticsPage />} />
              <Route path="/analytics/legacy" element={<AnalyticsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/profile" element={<UserProfilePage />} />
              <Route path="/unauthorized" element={<UnauthorizedPage />} />
            </Routes>
          </div>
          <Toaster position="top-right" richColors />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
