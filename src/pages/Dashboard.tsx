
import { useState, useEffect, startTransition } from "react";
import { useAuth } from "@/context/AuthContext";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Award, Users, User, MapPin, Clock, ChevronRight, Plus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { api } from '@/services/api';
import { Team, Event } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Suspense, lazy } from "react";

// Lazy load heavy components to avoid circular dependencies
const LazyAnalyticsDashboard = lazy(() => import("@/components/analytics/AnalyticsDashboard").then(module => ({
  default: module.AnalyticsDashboard
})));
const LazyRoleManagement = lazy(() => import("@/components/RoleManagement").then(module => ({
  default: module.RoleManagement
})));

const Dashboard = () => {
  const { hasRole } = useAuth();
  const navigate = useNavigate();
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [playerCount, setPlayerCount] = useState(0);
  const [pendingApprovals, setPendingApprovals] = useState(0);
  const [teamCount, setTeamCount] = useState(0);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  const handleTeamNavigation = (teamId: string) => {
    startTransition(() => {
      navigate(`/teams/${teamId}`);
    });
  };

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const teamsData = await api.getTeams();
        const activeTeams = teamsData.filter(team => team.active !== false);
        setTeams(activeTeams);
        setTeamCount(activeTeams.length);
        setUpcomingEvents([]);
        const allChildren = await api.getChildren();
        const pending = allChildren.filter(child => child.status === 'pending').length;
        setPendingApprovals(pending);
        const approved = allChildren.filter(child => child.status === 'approved').length;
        setPlayerCount(approved);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            {hasRole("admin") && <TabsTrigger value="management">Management</TabsTrigger>}
          </TabsList>
          
          <TabsContent value="overview" className="space-y-8 mt-8">
            <div className="grid gap-8 lg:grid-cols-2">
              {/* Enhanced upcoming events card */}
              <Card className="glass-card card-hover animate-scale-in">
                <CardHeader className="pb-4 px-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">Upcoming Events</CardTitle>
                      <CardDescription>Stay on top of your schedule</CardDescription>
                    </div>
                    <Link to="/events" className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 font-medium transition-colors">
                      View all <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                </CardHeader>
                <CardContent className="px-6">
                  {upcomingEvents.length > 0 ? (
                    <div className="space-y-4">
                      {upcomingEvents.map(event => (
                        <div key={event.id} className="group p-4 rounded-xl border hover:border-primary/30 hover:bg-accent/30 transition-all duration-300 card-hover">
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 shadow-glow">
                              <Calendar className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <h4 className="font-semibold text-base leading-tight truncate">{event.name}</h4>
                                <span className="px-3 py-1 text-xs font-medium bg-muted text-muted-foreground rounded-full whitespace-nowrap">
                                  {event.eventType}
                                </span>
                              </div>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Clock className="h-4 w-4 flex-shrink-0" />
                                  <span className="truncate">
                                    {new Date(`${event.date}T${event.time}`).toLocaleString('en-GB', {
                                      weekday: 'short',
                                      month: 'short',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <MapPin className="h-4 w-4 flex-shrink-0" />
                                  <span className="truncate">{event.location}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                      <p className="text-muted-foreground text-base font-medium">No upcoming events</p>
                      <p className="text-sm text-muted-foreground/70">Events will appear here when scheduled</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Enhanced teams card */}
              <Card className="glass-card card-hover animate-scale-in" style={{ animationDelay: '200ms' }}>
                <CardHeader className="pb-4 px-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">Active Teams</CardTitle>
                      <CardDescription>Teams currently in operation</CardDescription>
                    </div>
                    <Link to="/teams" className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 font-medium transition-colors">
                      View all <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                </CardHeader>
                <CardContent className="px-6">
                  {teams.length > 0 ? (
                    <div className="space-y-3">
                      {teams.slice(0, 4).map(team => (
                        <button 
                          key={team.id} 
                          onClick={() => handleTeamNavigation(team.id)}
                          className="group w-full text-left p-4 rounded-xl border-2 border-border/50 hover:border-primary/40 hover:bg-accent/30 transition-all duration-300 card-hover shadow-sm hover:shadow-elevation-medium"
                        >
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-primary/20 to-primary/10 border-2 border-primary/20 shadow-glow group-hover:shadow-primary/20">
                              {team.icon || team.profileImage ? (
                                <img src={team.icon || team.profileImage} alt={team.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Award className="h-6 w-6 text-primary group-hover:scale-110 transition-transform duration-300" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <h4 className="font-semibold text-base leading-tight truncate group-hover:text-primary transition-colors duration-200">{team.name}</h4>
                                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-200 flex-shrink-0" />
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                                <span className="font-medium">{team.ageGroup}</span>
                                <span className="w-1 h-1 bg-muted-foreground/50 rounded-full"></span>
                                <span>{team.category}</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Users className="h-3 w-3" />
                                <span>{team.players?.length || 0} players</span>
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                      <p className="text-muted-foreground text-base font-medium">No active teams</p>
                      <p className="text-sm text-muted-foreground/70">Create or activate teams to get started</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Enhanced quick actions */}
            {(hasRole("admin") || hasRole("coach") || hasRole("manager")) && (
              <Card className="glass-card animate-slide-in" style={{ animationDelay: '400ms' }}>
                <CardHeader className="px-6">
                  <CardTitle className="text-xl">Quick Actions</CardTitle>
                  <CardDescription>Common tasks and management</CardDescription>
                </CardHeader>
                <CardContent className="px-6">
                  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    <Button variant="default" className="h-auto p-4 flex-col items-start gap-2 shadow-glow card-hover" asChild>
                      <Link to="/approvals">
                        <div className="flex items-center gap-3 w-full">
                          <User className="h-5 w-5 flex-shrink-0" />
                          <div className="text-left flex-1 min-w-0">
                            <div className="font-semibold text-base">Review Approvals</div>
                            <div className="text-xs opacity-90">{pendingApprovals} pending review</div>
                          </div>
                        </div>
                      </Link>
                    </Button>
                    
                    <Button variant="outline" className="h-auto p-4 flex-col items-start gap-2 card-hover" asChild>
                      <Link to="/events/new">
                        <div className="flex items-center gap-3 w-full">
                          <Plus className="h-5 w-5 flex-shrink-0" />
                          <div className="text-left flex-1 min-w-0">
                            <div className="font-semibold text-base">Create Event</div>
                            <div className="text-xs text-muted-foreground">Schedule training or match</div>
                          </div>
                        </div>
                      </Link>
                    </Button>

                    {hasRole("admin") && (
                      <Button variant="outline" className="h-auto p-4 flex-col items-start gap-2 card-hover" asChild>
                        <Link to="/teams/new">
                          <div className="flex items-center gap-3 w-full">
                            <Award className="h-5 w-5 flex-shrink-0" />
                            <div className="text-left flex-1 min-w-0">
                              <div className="font-semibold text-base">Create Team</div>
                              <div className="text-xs text-muted-foreground">Add new team</div>
                            </div>
                          </div>
                        </Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Enhanced parent dashboard */}
            {hasRole("parent") && (
              <Card className="glass-card animate-slide-in" style={{ animationDelay: '600ms' }}>
                <CardHeader className="px-6">
                  <CardTitle className="text-xl">Parent Dashboard</CardTitle>
                  <CardDescription>Manage your children's registrations</CardDescription>
                </CardHeader>
                <CardContent className="px-6">
                  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                    <Button variant="default" className="h-auto p-4 flex-col items-start gap-2 shadow-glow card-hover" asChild>
                      <Link to="/children">
                        <div className="flex items-center gap-3 w-full">
                          <Users className="h-5 w-5 flex-shrink-0" />
                          <div className="text-left flex-1 min-w-0">
                            <div className="font-semibold text-base">My Children</div>
                            <div className="text-xs opacity-90">View registrations & status</div>
                          </div>
                        </div>
                      </Link>
                    </Button>
                    
                    <Button variant="outline" className="h-auto p-4 flex-col items-start gap-2 card-hover" asChild>
                      <Link to="/children/new">
                        <div className="flex items-center gap-3 w-full">
                          <Plus className="h-5 w-5 flex-shrink-0" />
                          <div className="text-left flex-1 min-w-0">
                            <div className="font-semibold text-base">Register Child</div>
                            <div className="text-xs text-muted-foreground">Add new player</div>
                          </div>
                        </div>
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="analytics" className="mt-8">
            <Suspense fallback={<div className="flex items-center justify-center h-64"><p className="text-muted-foreground">Loading analytics...</p></div>}>
              <LazyAnalyticsDashboard />
            </Suspense>
          </TabsContent>
          
          {hasRole("admin") && (
            <TabsContent value="management" className="mt-8">
              <Suspense fallback={<div className="flex items-center justify-center h-64"><p className="text-muted-foreground">Loading management...</p></div>}>
                <LazyRoleManagement />
              </Suspense>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </Layout>
  );
};

// Ensure proper default export for lazy loading
export default Dashboard;
