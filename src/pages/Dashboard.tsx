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
        {/* Stats section */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="shadow-sm hover:shadow transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Teams</CardTitle>
              <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center">
                <Award className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teamCount}</div>
              
            </CardContent>
          </Card>
          
          <Card className="shadow-sm hover:shadow transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Players</CardTitle>
              <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center">
                <Users className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{playerCount}</div>
              
            </CardContent>
          </Card>
          
          <Card className="shadow-sm hover:shadow transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Events</CardTitle>
              <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center">
                <Calendar className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{upcomingEvents.length}</div>
              
            </CardContent>
          </Card>
          
          {(hasRole("admin") || hasRole("coach") || hasRole("manager")) && <Card className="shadow-sm hover:shadow transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Approvals</CardTitle>
                <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center">
                  <User className="h-4 w-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingApprovals}</div>
                
              </CardContent>
            </Card>}
        </div>

        {/* Content rows */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Upcoming events */}
          <Card className="shadow-sm hover:shadow transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-semibold">Upcoming Events</CardTitle>
                  
                </div>
                <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {upcomingEvents.length > 0 ? <div className="space-y-4">
                  {upcomingEvents.map(event => <div key={event.id} className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 bg-accent text-primary">
                        <Calendar className="h-6 w-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{event.name}</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(`${event.date}T${event.time}`).toLocaleString('en-GB', {
                      dateStyle: 'medium',
                      timeStyle: 'short'
                    })}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">{event.location}</p>
                      </div>
                    </div>)}
                  <Button variant="outline" className="w-full mt-2" asChild>
                    <Link to="/events">View All Events</Link>
                  </Button>
                </div> : <p className="text-center py-8 text-muted-foreground">
                  No upcoming events scheduled
                </p>}
            </CardContent>
          </Card>

          {/* Teams section */}
          <Card className="shadow-sm hover:shadow transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-semibold">Your Teams</CardTitle>
                  
                </div>
                <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {teams.length > 0 ? <div className="space-y-4">
                  {teams.slice(0, 3).map(team => <div key={team.id} className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                      <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-accent flex items-center justify-center">
                        {team.icon || team.profileImage ? <img src={team.icon || team.profileImage} alt={team.name} className="w-full h-full object-cover" /> : <Users className="h-6 w-6 text-primary" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{team.name}</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {team.ageGroup} · {team.category}
                        </p>
                      </div>
                    </div>)}
                  <Button variant="outline" className="w-full mt-2" asChild>
                    <Link to="/teams">View All Teams</Link>
                  </Button>
                </div> : <p className="text-center py-8 text-muted-foreground">
                  You're not associated with any teams
                </p>}
            </CardContent>
          </Card>
        </div>

        {/* Additional section for admins, coaches, managers */}
        {(hasRole("admin") || hasRole("coach") || hasRole("manager")) && <Card className="shadow-sm hover:shadow transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Admin Actions</CardTitle>
              <CardDescription>
                Quick actions for club management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4 justify-center">
                <Button variant="default" className="bg-primary hover:bg-primary/90" asChild>
                  <Link to="/approvals">
                    Review Pending Approvals
                  </Link>
                </Button>
                <Button variant="outline" className="border-primary hover:bg-primary/10 text-primary" asChild>
                  <Link to="/events/new">
                    Create New Event
                  </Link>
                </Button>
                {hasRole("admin") && <Button variant="outline" className="border-primary hover:bg-primary/10 text-primary" asChild>
                  <Link to="/teams/new">
                    Create New Team
                  </Link>
                </Button>}
              </div>
            </CardContent>
          </Card>}

        {/* Parent specific section */}
        {hasRole("parent") && <Card className="shadow-sm hover:shadow transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Parent Actions</CardTitle>
              <CardDescription>
                Quick actions for parents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4 justify-center">
                <Button variant="default" className="bg-primary hover:bg-primary/90" asChild>
                  <Link to="/children">
                    Manage My Children
                  </Link>
                </Button>
                <Button variant="outline" className="border-primary hover:bg-primary/10 text-primary" asChild>
                  <Link to="/children/new">
                    Register New Child
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>}
      </div>
    </Layout>;
};
export default Dashboard;