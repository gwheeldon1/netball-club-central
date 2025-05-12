
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Award, Users, User } from "lucide-react";
import { Link } from "react-router-dom";
import { teamApi, childrenApi, eventApi } from "@/services/api";
import { Team, Event, Child } from "@/types";

const Dashboard = () => {
  const { currentUser, hasRole } = useAuth();
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
        const teamsData = teamApi.getAll();
        setTeams(teamsData);
        setTeamCount(teamsData.length);
        
        // Get events (in a real app, we would filter by date)
        const eventsData = eventApi.getAll();
        // Sort events by date and time to get upcoming events
        const sortedEvents = eventsData.sort((a, b) => {
          const dateA = new Date(`${a.date}T${a.time}`);
          const dateB = new Date(`${b.date}T${b.time}`);
          return dateA.getTime() - dateB.getTime();
        });
        setUpcomingEvents(sortedEvents.slice(0, 3));
        
        // Count children with pending status
        const allChildren = childrenApi.getAll();
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
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <p>Loading dashboard...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Welcome section */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {currentUser?.name}
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening with your netball club today
          </p>
        </div>

        {/* Stats section */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Total Teams</CardTitle>
              <Award className="h-4 w-4 text-netball-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teamCount}</div>
              <p className="text-xs text-muted-foreground">
                Active netball teams
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Total Players</CardTitle>
              <Users className="h-4 w-4 text-netball-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{playerCount}</div>
              <p className="text-xs text-muted-foreground">
                Registered players
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
              <Calendar className="h-4 w-4 text-netball-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{upcomingEvents.length}</div>
              <p className="text-xs text-muted-foreground">
                In the next 7 days
              </p>
            </CardContent>
          </Card>
          
          {(hasRole("admin") || hasRole("coach") || hasRole("manager")) && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                <User className="h-4 w-4 text-netball-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingApprovals}</div>
                <p className="text-xs text-muted-foreground">
                  Waiting for review
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Content rows */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Upcoming events */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
              <CardDescription>
                Your scheduled events for the next few days
              </CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingEvents.length > 0 ? (
                <div className="space-y-4">
                  {upcomingEvents.map((event) => (
                    <div key={event.id} className="flex items-start gap-4 p-3 rounded-lg border">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                        event.eventType === 'match' 
                          ? 'bg-orange-100 text-orange-600' 
                          : event.eventType === 'training' 
                            ? 'bg-blue-100 text-blue-600'
                            : 'bg-purple-100 text-purple-600'
                      }`}>
                        <Calendar className="h-6 w-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{event.name}</h4>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(`${event.date}T${event.time}`).toLocaleString('en-GB', { 
                            dateStyle: 'medium', 
                            timeStyle: 'short' 
                          })}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{event.location}</p>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/events">View All Events</Link>
                  </Button>
                </div>
              ) : (
                <p className="text-center py-4 text-gray-500">
                  No upcoming events scheduled
                </p>
              )}
            </CardContent>
          </Card>

          {/* Teams section */}
          <Card>
            <CardHeader>
              <CardTitle>Your Teams</CardTitle>
              <CardDescription>
                Teams you're associated with
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teams.slice(0, 3).map((team) => (
                  <div key={team.id} className="flex items-center gap-4 p-3 rounded-lg border">
                    <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                      <img 
                        src={team.icon || team.profileImage} 
                        alt={team.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">{team.name}</h4>
                      <p className="text-xs text-gray-500 mt-1">
                        {team.ageGroup} · {team.category}
                      </p>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/teams">View All Teams</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional section for admins, coaches, managers */}
        {(hasRole("admin") || hasRole("coach") || hasRole("manager")) && (
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Admin Actions</CardTitle>
                <CardDescription>
                  Quick actions for club management
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-3">
                <Button className="bg-netball-500 hover:bg-netball-600" asChild>
                  <Link to="/approvals">
                    Review Pending Approvals
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/events/new">
                    Create New Event
                  </Link>
                </Button>
                {hasRole("admin") && (
                  <Button variant="outline" asChild>
                    <Link to="/teams/new">
                      Create New Team
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Parent specific section */}
        {hasRole("parent") && (
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Parent Actions</CardTitle>
                <CardDescription>
                  Quick actions for parents
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-3">
                <Button className="bg-netball-500 hover:bg-netball-600" asChild>
                  <Link to="/children">
                    Manage My Children
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/children/new">
                    Register New Child
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
