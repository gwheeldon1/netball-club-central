
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Award, Users, User, MapPin, Clock, ChevronRight } from "lucide-react";
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
      <div className="space-y-6 pt-4 lg:pt-0">
        {/* Compact Stats section */}
        <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
          <div className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Teams</p>
                <p className="text-xl font-bold">{teamCount}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Award className="h-4 w-4 text-primary" />
              </div>
            </div>
          </div>
          
          <div className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Players</p>
                <p className="text-xl font-bold">{playerCount}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-4 w-4 text-primary" />
              </div>
            </div>
          </div>
          
          <div className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Events</p>
                <p className="text-xl font-bold">{upcomingEvents.length}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Calendar className="h-4 w-4 text-primary" />
              </div>
            </div>
          </div>
          
          {(hasRole("admin") || hasRole("coach") || hasRole("manager")) && 
            <div className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Approvals</p>
                  <p className="text-xl font-bold">{pendingApprovals}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-4 w-4 text-primary" />
                </div>
              </div>
            </div>
          }
        </div>

        {/* Compact Content sections */}
        <div className="space-y-4">
          {/* Upcoming events - list view */}
          <Card className="hover:shadow-md transition-shadow border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">Upcoming Events</CardTitle>
                <Link to="/events" className="text-primary hover:text-primary/80 text-sm font-medium flex items-center gap-1">
                  View All <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {upcomingEvents.length > 0 ? (
                <div className="space-y-2">
                  {upcomingEvents.slice(0, 4).map((event) => (
                    <div 
                      key={event.id} 
                      className="flex items-center gap-3 p-3 rounded-md border border-border bg-card/50 hover:bg-accent/50 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-primary/10 text-primary">
                        <Calendar className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h4 className="font-medium text-sm truncate">{event.name}</h4>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {new Date(`${event.date}T${event.time}`).toLocaleString('en-GB', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                              <span className="flex items-center gap-1 truncate">
                                <MapPin className="h-3 w-3 flex-shrink-0" />
                                <span className="truncate">{event.location}</span>
                              </span>
                            </div>
                          </div>
                          <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-md flex-shrink-0">
                            {event.eventType}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground text-sm">No upcoming events scheduled</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Teams section - compact grid */}
          <Card className="hover:shadow-md transition-shadow border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">Your Teams</CardTitle>
                <Link to="/teams" className="text-primary hover:text-primary/80 text-sm font-medium flex items-center gap-1">
                  View All <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {teams.length > 0 ? (
                <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
                  {teams.slice(0, 4).map(team => (
                    <div key={team.id} className="flex items-center gap-3 p-3 rounded-md border border-border bg-card/50 hover:bg-accent/50 transition-colors">
                      <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-accent flex items-center justify-center">
                        {team.icon || team.profileImage ? 
                          <img src={team.icon || team.profileImage} alt={team.name} className="w-full h-full object-cover" /> : 
                          <Users className="h-5 w-5 text-primary" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{team.name}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {team.ageGroup} · {team.category}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground text-sm">You're not associated with any teams</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions - more compact */}
        {(hasRole("admin") || hasRole("coach") || hasRole("manager")) && (
          <Card className="hover:shadow-md transition-shadow border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                <Button variant="default" className="bg-primary hover:bg-primary/90 justify-start h-auto py-3" asChild>
                  <Link to="/approvals" className="flex items-center gap-3">
                    <User className="h-4 w-4" />
                    <div className="text-left">
                      <div className="font-medium">Review Approvals</div>
                      <div className="text-xs opacity-90">{pendingApprovals} pending</div>
                    </div>
                  </Link>
                </Button>
                <Button variant="outline" className="border-border justify-start h-auto py-3" asChild>
                  <Link to="/events/new" className="flex items-center gap-3">
                    <Calendar className="h-4 w-4" />
                    <div className="text-left">
                      <div className="font-medium">Create Event</div>
                      <div className="text-xs text-muted-foreground">Schedule training or match</div>
                    </div>
                  </Link>
                </Button>
                {hasRole("admin") && (
                  <Button variant="outline" className="border-border justify-start h-auto py-3" asChild>
                    <Link to="/teams/new" className="flex items-center gap-3">
                      <Award className="h-4 w-4" />
                      <div className="text-left">
                        <div className="font-medium">Create Team</div>
                        <div className="text-xs text-muted-foreground">Add new team</div>
                      </div>
                    </Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {hasRole("parent") && (
          <Card className="hover:shadow-md transition-shadow border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold">Parent Actions</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid gap-2 grid-cols-1 sm:grid-cols-2">
                <Button variant="default" className="bg-primary hover:bg-primary/90 justify-start h-auto py-3" asChild>
                  <Link to="/children" className="flex items-center gap-3">
                    <Users className="h-4 w-4" />
                    <div className="text-left">
                      <div className="font-medium">Manage Children</div>
                      <div className="text-xs opacity-90">View registrations</div>
                    </div>
                  </Link>
                </Button>
                <Button variant="outline" className="border-border justify-start h-auto py-3" asChild>
                  <Link to="/children/new" className="flex items-center gap-3">
                    <User className="h-4 w-4" />
                    <div className="text-left">
                      <div className="font-medium">Register Child</div>
                      <div className="text-xs text-muted-foreground">Add new player</div>
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
