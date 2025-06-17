
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Layout from "@/components/Layout";
import { teamApi } from '@/services/api';
import { Team } from "@/types/unified";
import { TeamPlayer, TeamStaff } from "@/services/api/teams/types";
import { Child, User, UserRole } from "@/types/unified";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Calendar, User as UserIcon, Award, Edit, Camera, Archive } from "lucide-react";
import { toast } from "sonner";
import { TeamImageManager } from "@/components/TeamImageManager";

const TeamDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const [team, setTeam] = useState<Team | null>(null);
  const [players, setPlayers] = useState<Child[]>([]);
  const [coaches, setCoaches] = useState<User[]>([]);
  const [managers, setManagers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showImageManager, setShowImageManager] = useState(false);
  const [updatingArchived, setUpdatingArchived] = useState(false);
  
  // Helper function to convert TeamPlayer to Child
  const convertTeamPlayerToChild = (teamPlayer: TeamPlayer): Child => ({
    id: teamPlayer.id,
    name: teamPlayer.name,
    dateOfBirth: teamPlayer.dateOfBirth || '', // Provide default empty string
    profileImage: teamPlayer.profileImage,
    ageGroup: teamPlayer.ageGroup,
    teamId: teamPlayer.teamId,
    parentId: teamPlayer.parentId,
    status: teamPlayer.status
  });

  // Helper function to convert TeamStaff to User
  const convertTeamStaffToUser = (teamStaff: TeamStaff): User => ({
    id: teamStaff.id,
    name: teamStaff.name,
    email: teamStaff.email,
    profileImage: teamStaff.profileImage,
    roles: teamStaff.roles as UserRole[] // Type assertion since we know these are valid roles
  });
  
  useEffect(() => {
    const loadTeamData = async () => {
      if (!id) return;
      
      try {
        // Get team details
        const teamData = await teamApi.getTeamById(id);
        if (!teamData) {
          toast.error("Team not found");
          navigate("/teams");
          return;
        }
        
        setTeam(teamData);
        
        // Get players in this team
        const teamPlayers = await teamApi.getTeamPlayers(id);
        setPlayers(teamPlayers.map(convertTeamPlayerToChild));
        
        // Get team staff
        const { coaches: teamCoaches, managers: teamManagers } = await teamApi.getTeamStaff(id);
        setCoaches(teamCoaches.map(convertTeamStaffToUser));
        setManagers(teamManagers.map(convertTeamStaffToUser));
      } catch (error) {
        console.error("Error loading team data:", error);
        toast.error("Failed to load team data");
      } finally {
        setLoading(false);
      }
    };
    
    loadTeamData();
  }, [id, navigate]);

  const handleImagesUpdated = (bannerImage?: string, profileImage?: string) => {
    if (team) {
      setTeam({
        ...team,
        bannerImage: bannerImage || team.bannerImage,
        profileImage: profileImage || team.profileImage
      });
    }
  };

  const handleArchivedToggle = async (archived: boolean) => {
    if (!team || !hasRole('admin')) return;
    
    setUpdatingArchived(true);
    try {
      const updatedTeam = await teamApi.updateTeam(team.id, { archived });
      if (updatedTeam) {
        setTeam(updatedTeam);
        toast.success(`Team ${archived ? 'archived' : 'unarchived'} successfully`);
      }
    } catch (error) {
      console.error("Error updating team archived status:", error);
      toast.error("Failed to update team status");
    } finally {
      setUpdatingArchived(false);
    }
  };

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
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  {team.name}
                </h1>
                {team.archived && (
                  <div className="bg-orange-500/20 text-orange-300 px-2 py-1 rounded text-sm font-medium">
                    Archived
                  </div>
                )}
              </div>
              <p className="text-sm sm:text-base opacity-90">
                {team.ageGroup} • {team.category}
              </p>
            </div>
          </div>

          {/* Image Management Button */}
          {(hasRole("admin") || hasRole("coach") || hasRole("manager")) && (
            <Button
              variant="outline"
              size="sm"
              className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm"
              onClick={() => setShowImageManager(true)}
            >
              <Camera className="mr-2 h-4 w-4" />
              Manage Images
            </Button>
          )}
        </div>

        {/* Admin Controls */}
        {hasRole("admin") && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Archive className="h-5 w-5" />
                Admin Controls
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Switch
                  id="archived"
                  checked={team.archived || false}
                  onCheckedChange={handleArchivedToggle}
                  disabled={updatingArchived}
                />
                <Label htmlFor="archived">
                  {team.archived ? 'Unarchive team' : 'Archive team'}
                </Label>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {team.archived 
                  ? 'This team is currently archived and hidden from normal views.'
                  : 'Archive this team to hide it from normal views while preserving data.'
                }
              </p>
            </CardContent>
          </Card>
        )}
        
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

        {/* Image Manager Dialog */}
        <TeamImageManager
          isOpen={showImageManager}
          onClose={() => setShowImageManager(false)}
          teamId={team.id}
          teamName={team.name}
          currentBannerImage={team.bannerImage}
          currentProfileImage={team.profileImage}
          onImagesUpdated={handleImagesUpdated}
        />
      </div>
    </Layout>
  );
};

export default TeamDetailPage;
