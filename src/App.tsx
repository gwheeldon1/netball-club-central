
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import TeamsPage from './pages/TeamsPage';
import NewTeamPage from "@/pages/NewTeamPage";
import TeamDetailPage from "@/pages/TeamDetailPage";
import EventsPage from './pages/EventsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import EnhancedAnalyticsPage from './pages/EnhancedAnalyticsPage';
import ModernAnalyticsPage from './pages/ModernAnalyticsPage';
import AdminDashboard from "@/pages/AdminDashboard";
import UnauthorizedPage from "@/pages/UnauthorizedPage";
import { AnalyticsDashboard } from './components/analytics/AnalyticsDashboard';
import PlayerPerformanceDashboard from './components/PlayerPerformanceDashboard';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<ModernAnalyticsPage />} />
            <Route path="/teams" element={<TeamsPage />} />
            <Route path="/teams/new" element={<NewTeamPage />} />
            <Route path="/teams/:id" element={<TeamDetailPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/analytics" element={<ModernAnalyticsPage />} />
            <Route path="/analytics/enhanced" element={<EnhancedAnalyticsPage />} />
            <Route path="/analytics/legacy" element={<AnalyticsPage />} />
            <Route path="/analytics/overview" element={<AnalyticsDashboard />} />
            <Route path="/analytics/player-performance" element={<PlayerPerformanceDashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
