import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Award, Users, User, MapPin, Clock, ChevronRight, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { supabaseTeamApi, supabaseChildrenApi } from "@/services/supabaseApi";
import { Team, Event, Child } from "@/types";

const Dashboard = () => {
  const {
    currentUser,
    hasRole
  } = useAuth();
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [playerCount, setPlayerCount] = useState(0);
  const [pendingApprovals, setPendingApprovals] = useState(0);
  const [teamCount, setTeamCount] = useState(0);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Get teams
        const teamsData = await supabaseTeamApi.getAll();
        setTeams(teamsData);
        setTeamCount(teamsData.length);

        // Events functionality not yet implemented in Supabase API
        setUpcomingEvents([]);

        // Count children with pending status
        const allChildren = await supabaseChildrenApi.getAll();
        const pending = allChildren.filter(child => child.status === 'pending').length;
        setPendingApprovals(pending);

        // Count approved children
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
    return <Layout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </Layout>;
  }
  return <Layout>
      <div className="space-y-6 sm:space-y-8">
        <div className="grid gap-6 sm:gap-8 lg:grid-cols-2">
          {/* Upcoming Events */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg sm:text-xl">Upcoming Events</CardTitle>
                  
                </div>
                <Link to="/events" className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 font-medium">
                  View all <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              {upcomingEvents.length > 0 ? <div className="space-y-3">
                  {upcomingEvents.map(event => <div key={event.id} className="group p-3 sm:p-4 rounded-lg border hover:border-primary/30 hover:bg-accent/30 transition-all duration-200">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h4 className="font-semibold text-sm sm:text-base leading-tight truncate">{event.name}</h4>
                            <span className="px-2 py-1 text-xs font-medium bg-muted text-muted-foreground rounded-md whitespace-nowrap">
                              {event.eventType}
                            </span>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                              <Clock className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
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
                            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                              <MapPin className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                              <span className="truncate">{event.location}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>)}
                </div> : <div className="text-center py-6 sm:py-8">
                  <Calendar className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm sm:text-base">No upcoming events</p>
                  <p className="text-xs sm:text-sm text-muted-foreground/70">Events will appear here when scheduled</p>
                </div>}
            </CardContent>
          </Card>

          {/* Teams */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg sm:text-xl">Your Teams</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Teams you're involved with</CardDescription>
                </div>
                <Link to="/teams" className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 font-medium">
                  View all <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              {teams.length > 0 ? <div className="space-y-3">
                  {teams.slice(0, 4).map(team => <div key={team.id} className="flex items-start gap-3 p-3 sm:p-4 rounded-lg border hover:border-primary/30 hover:bg-accent/30 transition-all duration-200">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg overflow-hidden flex-shrink-0 bg-primary/10 border border-border">
                        {team.icon || team.profileImage ? <img src={team.icon || team.profileImage} alt={team.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center">
                            <Users className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                          </div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm sm:text-base leading-tight truncate mb-1">{team.name}</h4>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {team.ageGroup} • {team.category}
                        </p>
                      </div>
                    </div>)}
                </div> : <div className="text-center py-6 sm:py-8">
                  <Users className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm sm:text-base">No teams yet</p>
                  <p className="text-xs sm:text-sm text-muted-foreground/70">Join or create teams to get started</p>
                </div>}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        {(hasRole("admin") || hasRole("coach") || hasRole("manager")) && <Card className="border-0 shadow-lg">
            <CardHeader className="px-4 sm:px-6">
              <CardTitle className="text-lg sm:text-xl">Quick Actions</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Common tasks and management</CardDescription>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                <Button variant="default" className="h-auto p-3 sm:p-4 flex-col items-start gap-2" asChild>
                  <Link to="/approvals">
                    <div className="flex items-center gap-2 sm:gap-3 w-full">
                      <User className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                      <div className="text-left flex-1 min-w-0">
                        <div className="font-semibold text-sm sm:text-base">Review Approvals</div>
                        <div className="text-xs opacity-90">{pendingApprovals} pending review</div>
                      </div>
                    </div>
                  </Link>
                </Button>
                
                <Button variant="outline" className="h-auto p-3 sm:p-4 flex-col items-start gap-2" asChild>
                  <Link to="/events/new">
                    <div className="flex items-center gap-2 sm:gap-3 w-full">
                      <Plus className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                      <div className="text-left flex-1 min-w-0">
                        <div className="font-semibold text-sm sm:text-base">Create Event</div>
                        <div className="text-xs text-muted-foreground">Schedule training or match</div>
                      </div>
                    </div>
                  </Link>
                </Button>

                {hasRole("admin") && <Button variant="outline" className="h-auto p-3 sm:p-4 flex-col items-start gap-2 sm:col-span-2 lg:col-span-1" asChild>
                    <Link to="/teams/new">
                      <div className="flex items-center gap-2 sm:gap-3 w-full">
                        <Award className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                        <div className="text-left flex-1 min-w-0">
                          <div className="font-semibold text-sm sm:text-base">Create Team</div>
                          <div className="text-xs text-muted-foreground">Add new team</div>
                        </div>
                      </div>
                    </Link>
                  </Button>}
              </div>
            </CardContent>
          </Card>}

        {hasRole("parent") && <Card className="border-0 shadow-lg">
            <CardHeader className="px-4 sm:px-6">
              <CardTitle className="text-lg sm:text-xl">Parent Dashboard</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Manage your children's registrations</CardDescription>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
                <Button variant="default" className="h-auto p-3 sm:p-4 flex-col items-start gap-2" asChild>
                  <Link to="/children">
                    <div className="flex items-center gap-2 sm:gap-3 w-full">
                      <Users className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                      <div className="text-left flex-1 min-w-0">
                        <div className="font-semibold text-sm sm:text-base">My Children</div>
                        <div className="text-xs opacity-90">View registrations & status</div>
                      </div>
                    </div>
                  </Link>
                </Button>
                
                <Button variant="outline" className="h-auto p-3 sm:p-4 flex-col items-start gap-2" asChild>
                  <Link to="/children/new">
                    <div className="flex items-center gap-2 sm:gap-3 w-full">
                      <Plus className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                      <div className="text-left flex-1 min-w-0">
                        <div className="font-semibold text-sm sm:text-base">Register Child</div>
                        <div className="text-xs text-muted-foreground">Add new player</div>
                      </div>
                    </div>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>}
      </div>
    </Layout>;
};

export default Dashboard;
