
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Award, Users, User, MapPin, Clock, ChevronRight, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { teamApi, childrenApi, eventApi } from "@/services/api";
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
        const teamsData = await teamApi.getAll();
        setTeams(teamsData);
        setTeamCount(teamsData.length);

        // Get events (in a real app, we would filter by date)
        const eventsData = await eventApi.getAll();
        // Sort events by date and time to get upcoming events
        const sortedEvents = eventsData.sort((a, b) => {
          const dateA = new Date(`${a.date}T${a.time}`);
          const dateB = new Date(`${b.date}T${b.time}`);
          return dateA.getTime() - dateB.getTime();
        });
        setUpcomingEvents(sortedEvents.slice(0, 3));

        // Count children with pending status
        const allChildren = await childrenApi.getAll();
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
      <div className="space-y-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Upcoming Events */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Upcoming Events</CardTitle>
                  <CardDescription>Your next scheduled activities</CardDescription>
                </div>
                <Link 
                  to="/events" 
                  className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 font-medium"
                >
                  View all <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {upcomingEvents.length > 0 ? (
                <div className="space-y-3">
                  {upcomingEvents.map((event) => (
                    <div 
                      key={event.id} 
                      className="group p-4 rounded-lg border hover:border-primary/30 hover:bg-accent/30 transition-all duration-200"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Calendar className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h4 className="font-semibold text-base leading-tight truncate">{event.name}</h4>
                            <span className="px-2 py-1 text-xs font-medium bg-muted text-muted-foreground rounded-md whitespace-nowrap">
                              {event.eventType}
                            </span>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              <span>
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
                              <MapPin className="h-4 w-4" />
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
                  <Calendar className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-muted-foreground">No upcoming events</p>
                  <p className="text-sm text-muted-foreground/70">Events will appear here when scheduled</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Teams */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Your Teams</CardTitle>
                  <CardDescription>Teams you're involved with</CardDescription>
                </div>
                <Link 
                  to="/teams" 
                  className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 font-medium"
                >
                  View all <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {teams.length > 0 ? (
                <div className="space-y-3">
                  {teams.slice(0, 4).map(team => (
                    <div key={team.id} className="flex items-center gap-4 p-3 rounded-lg border border-border hover:border-primary/20 hover:bg-accent/50 transition-all duration-200">
                      <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-accent border border-border">
                        {team.icon || team.profileImage ? 
                          <img src={team.icon || team.profileImage} alt={team.name} className="w-full h-full object-cover" /> : 
                          <div className="w-full h-full flex items-center justify-center">
                            <Users className="h-6 w-6 text-primary" />
                          </div>
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-base truncate">{team.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {team.ageGroup} • {team.category}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-muted-foreground">No teams yet</p>
                  <p className="text-sm text-muted-foreground/70">Join or create teams to get started</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        {(hasRole("admin") || hasRole("coach") || hasRole("manager")) && (
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">Quick Actions</CardTitle>
              <CardDescription>Common tasks and management</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Button 
                  variant="default" 
                  className="h-auto p-4 flex-col items-start gap-2" 
                  asChild
                >
                  <Link to="/approvals">
                    <div className="flex items-center gap-3 w-full">
                      <User className="h-5 w-5" />
                      <div className="text-left flex-1">
                        <div className="font-semibold">Review Approvals</div>
                        <div className="text-xs opacity-90">{pendingApprovals} pending review</div>
                      </div>
                    </div>
                  </Link>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-auto p-4 flex-col items-start gap-2" 
                  asChild
                >
                  <Link to="/events/new">
                    <div className="flex items-center gap-3 w-full">
                      <Plus className="h-5 w-5" />
                      <div className="text-left flex-1">
                        <div className="font-semibold">Create Event</div>
                        <div className="text-xs text-muted-foreground">Schedule training or match</div>
                      </div>
                    </div>
                  </Link>
                </Button>

                {hasRole("admin") && (
                  <Button 
                    variant="outline" 
                    className="h-auto p-4 flex-col items-start gap-2" 
                    asChild
                  >
                    <Link to="/teams/new">
                      <div className="flex items-center gap-3 w-full">
                        <Award className="h-5 w-5" />
                        <div className="text-left flex-1">
                          <div className="font-semibold">Create Team</div>
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

        {hasRole("parent") && (
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">Parent Dashboard</CardTitle>
              <CardDescription>Manage your children's registrations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <Button 
                  variant="default" 
                  className="h-auto p-4 flex-col items-start gap-2" 
                  asChild
                >
                  <Link to="/children">
                    <div className="flex items-center gap-3 w-full">
                      <Users className="h-5 w-5" />
                      <div className="text-left flex-1">
                        <div className="font-semibold">My Children</div>
                        <div className="text-xs opacity-90">View registrations & status</div>
                      </div>
                    </div>
                  </Link>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-auto p-4 flex-col items-start gap-2" 
                  asChild
                >
                  <Link to="/children/new">
                    <div className="flex items-center gap-3 w-full">
                      <Plus className="h-5 w-5" />
                      <div className="text-left flex-1">
                        <div className="font-semibold">Register Child</div>
                        <div className="text-xs text-muted-foreground">Add new player</div>
                      </div>
                    </div>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>;
};

export default Dashboard;
