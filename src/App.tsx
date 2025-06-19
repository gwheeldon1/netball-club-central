import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { StoreProvider } from "./providers/StoreProvider";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProfilePage from "./pages/ProfilePage";
import ProtectedRoute from "./components/ProtectedRoute";
import Unauthorized from "./pages/Unauthorized";
import TeamsPage from "./pages/TeamsPage";
import TeamDetailsPage from "./pages/TeamDetailsPage";
import NewTeamPage from "./pages/NewTeamPage";
import EditTeamPage from "./pages/EditTeamPage";
import EventsPage from "./pages/EventsPage";
import NewEventPage from "./pages/NewEventPage";
import EditEventPage from "./pages/EditEventPage";
import EventDetailsPage from "./pages/EventDetailsPage";
import ChildrenPage from "./pages/ChildrenPage";
import NewChildPage from "./pages/NewChildPage";
import EditChildPage from "./pages/EditChildPage";
import AttendancePage from "./pages/AttendancePage";
import UsersPage from "./pages/UsersPage";
import UserDetailsPage from "./pages/UserDetailsPage";
import GroupsPage from "./pages/GroupsPage";
import GroupDetailsPage from "./pages/GroupDetailsPage";
import NewGroupPage from "./pages/NewGroupPage";
import EditGroupPage from "./pages/EditGroupPage";
import SettingsPage from "./pages/SettingsPage";
import ApprovalsPage from "./pages/ApprovalsPage";
import MatchStatsPage from "./pages/MatchStatsPage";
import NewMatchStatsPage from "./pages/NewMatchStatsPage";
import EditMatchStatsPage from "./pages/EditMatchStatsPage";
import { ScrollToTop } from "./components/ScrollToTop";

const queryClient = new QueryClient();

function App() {
  return (
    <StoreProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <BrowserRouter>
            <AuthProvider>
              <Routes>
                <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
                <Route path="/login" element={<ProtectedRoute requireAuth={false}><Login /></ProtectedRoute>} />
                <Route path="/register" element={<ProtectedRoute requireAuth={false}><Register /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                <Route path="/unauthorized" element={<Unauthorized />} />

                {/* Teams routes */}
                <Route path="/teams" element={<ProtectedRoute><TeamsPage /></ProtectedRoute>} />
                <Route path="/teams/:teamId" element={<ProtectedRoute><TeamDetailsPage /></ProtectedRoute>} />
                <Route path="/teams/new" element={<ProtectedRoute><NewTeamPage /></ProtectedRoute>} />
                <Route path="/teams/:teamId/edit" element={<ProtectedRoute><EditTeamPage /></ProtectedRoute>} />

                {/* Events routes */}
                <Route path="/events" element={<ProtectedRoute><EventsPage /></ProtectedRoute>} />
                <Route path="/events/new" element={<ProtectedRoute><NewEventPage /></ProtectedRoute>} />
                <Route path="/events/:eventId" element={<ProtectedRoute><EventDetailsPage /></ProtectedRoute>} />
                <Route path="/events/:eventId/edit" element={<ProtectedRoute><EditEventPage /></ProtectedRoute>} />

                {/* Children routes */}
                <Route path="/children" element={<ProtectedRoute><ChildrenPage /></ProtectedRoute>} />
                <Route path="/children/new" element={<ProtectedRoute><NewChildPage /></ProtectedRoute>} />
                <Route path="/children/:childId/edit" element={<ProtectedRoute><EditChildPage /></ProtectedRoute>} />

                {/* Attendance route */}
                <Route path="/events/:eventId/attendance" element={<ProtectedRoute><AttendancePage /></ProtectedRoute>} />

                {/* Users routes */}
                <Route path="/users" element={<ProtectedRoute><UsersPage /></ProtectedRoute>} />
                <Route path="/users/:userId" element={<ProtectedRoute><UserDetailsPage /></ProtectedRoute>} />

                {/* Groups routes */}
                <Route path="/groups" element={<ProtectedRoute><GroupsPage /></ProtectedRoute>} />
                <Route path="/groups/:groupId" element={<ProtectedRoute><GroupDetailsPage /></ProtectedRoute>} />
                <Route path="/groups/new" element={<ProtectedRoute><NewGroupPage /></ProtectedRoute>} />
                <Route path="/groups/:groupId/edit" element={<ProtectedRoute><EditGroupPage /></ProtectedRoute>} />

                {/* Settings route */}
                <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

                {/* Approvals route */}
                <Route path="/approvals" element={<ProtectedRoute><ApprovalsPage /></ProtectedRoute>} />

                {/* Match Stats routes */}
                <Route path="/match-stats" element={<ProtectedRoute><MatchStatsPage /></ProtectedRoute>} />
                <Route path="/match-stats/new" element={<ProtectedRoute><NewMatchStatsPage /></ProtectedRoute>} />
                <Route path="/match-stats/:matchStatsId/edit" element={<ProtectedRoute><EditMatchStatsPage /></ProtectedRoute>} />
              </Routes>
              <ScrollToTop />
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </StoreProvider>
  );
}

export default App;
