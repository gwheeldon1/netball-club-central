
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Layout from "@/components/Layout";
import { api } from '@/services/unifiedApi';
import { Team, Child, User } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, User as UserIcon, Award, Edit } from "lucide-react";
import { toast } from "sonner";

const TeamDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser, hasRole } = useAuth();
  const [team, setTeam] = useState<Team | null>(null);
  const [players, setPlayers] = useState<Child[]>([]);
  const [coaches, setCoaches] = useState<User[]>([]);
  const [managers, setManagers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadTeamData = async () => {
      if (!id) return;
      
      try {
        // Get team details
        const teamData = await api.getTeamById(id);
        if (!teamData) {
          toast.error("Team not found");
          navigate("/teams");
          return;
        }
        
        setTeam(teamData);
        
        // Get players in this team - not yet implemented in unified API
        const teamPlayers: any[] = [];
        setPlayers(teamPlayers);
        
        // In a real app, we'd have proper team membership records
        // For now, we'll simulate coaches and managers - not yet implemented in unified API
        const allUsers: any[] = [];
        
        const teamCoaches = allUsers.filter(user => 
          user.roles.includes('coach')
        );
        setCoaches(teamCoaches.slice(0, 2)); // Just take a couple for demo
        
        const teamManagers = allUsers.filter(user => 
          user.roles.includes('manager')
        );
        setManagers(teamManagers.slice(0, 1)); // Just take one for demo
      } catch (error) {
        console.error("Error loading team data:", error);
        toast.error("Failed to load team data");
      } finally {
        setLoading(false);
      }
    };
    
    loadTeamData();
  }, [id, navigate]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <p>Loading team details...</p>
        </div>
      </Layout>
    );
  }

  if (!team) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p>Team not found.</p>
          <Button className="mt-4" variant="outline" asChild>
            <Link to="/teams">Back to Teams</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Team Header/Banner */}
        <div className="relative rounded-lg overflow-hidden">
          {team.bannerImage ? (
            <div className="h-48 md:h-64 w-full">
              <img 
                src={team.bannerImage} 
                alt={team.name} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>
          ) : (
            <div className="h-48 md:h-64 w-full bg-gradient-to-r from-primary/20 to-primary/30" />
          )}
          
          <div className={`absolute bottom-0 left-0 right-0 p-6 flex items-center gap-4 ${team.bannerImage ? 'text-primary-foreground' : 'text-foreground'}`}>
            <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full overflow-hidden border-4 border-background bg-background">
              <img 
                src={team.icon || team.profileImage || "/placeholder.svg"} 
                alt="" 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                {team.name}
              </h1>
              <p className="text-sm sm:text-base opacity-90">
                {team.ageGroup} • {team.category}
              </p>
            </div>
          </div>
        </div>
        
        {/* Admin/Coach/Manager actions */}
        <div className="flex flex-wrap gap-3">
          {(hasRole("admin") || hasRole("coach") || hasRole("manager")) && (
            <Button className="bg-primary hover:bg-primary/90" asChild>
              <Link to={`/events/new?teamId=${team.id}`}>
                <Calendar className="mr-2 h-4 w-4" />
                Create Event
              </Link>
            </Button>
          )}
          
          {hasRole("admin") && (
            <Button variant="outline" asChild>
              <Link to={`/teams/${team.id}/edit`}>
                <Edit className="mr-2 h-4 w-4 text-primary" />
                Edit Team
              </Link>
            </Button>
          )}
        </div>
        
        {/* Team content */}
        <div>
          <Tabs defaultValue="about">
            <TabsList className="w-full max-w-md mb-6">
              <TabsTrigger value="about" className="flex-1">About</TabsTrigger>
              <TabsTrigger value="players" className="flex-1">Players ({players.length})</TabsTrigger>
              <TabsTrigger value="staff" className="flex-1">Staff ({coaches.length + managers.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="about">
              <Card>
                <CardHeader>
                  <CardTitle>Team Details</CardTitle>
                </CardHeader>
                <CardContent>
                  {team.description ? (
                    <p className="text-muted-foreground whitespace-pre-line">{team.description}</p>
                  ) : (
                    <p className="text-muted-foreground">No team description available.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="players">
              <Card>
                <CardHeader>
                  <CardTitle>Team Players</CardTitle>
                </CardHeader>
                <CardContent>
                  {players.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {players.map((player) => (
                        <div key={player.id} className="flex items-center gap-3 p-3 rounded-lg border">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={player.profileImage} alt={player.name} />
                            <AvatarFallback>
                              <UserIcon className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{player.name}</p>
                            <p className="text-xs text-muted-foreground">{player.ageGroup}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No players assigned to this team yet.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="staff">
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-primary" />
                      Coaches
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {coaches.length > 0 ? (
                      <div className="space-y-3">
                        {coaches.map((coach) => (
                          <div key={coach.id} className="flex items-center gap-3 p-3 rounded-lg border">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={coach.profileImage} alt={coach.name} />
                              <AvatarFallback>
                                <UserIcon className="h-4 w-4" />
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">{coach.name}</p>
                              <p className="text-xs text-muted-foreground">{coach.email}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No coaches assigned to this team.</p>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <UserIcon className="h-5 w-5 text-primary" />
                      Managers
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {managers.length > 0 ? (
                      <div className="space-y-3">
                        {managers.map((manager) => (
                          <div key={manager.id} className="flex items-center gap-3 p-3 rounded-lg border">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={manager.profileImage} alt={manager.name} />
                              <AvatarFallback>
                                <UserIcon className="h-4 w-4" />
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">{manager.name}</p>
                              <p className="text-xs text-muted-foreground">{manager.email}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No managers assigned to this team.</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default TeamDetailPage;
