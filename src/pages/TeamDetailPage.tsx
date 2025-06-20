import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Edit, 
  Trash2, 
  Users, 
  Calendar, 
  Award, 
  AlertCircle,
  ArrowLeft,
  UserCheck,
  UserX,
  RefreshCw
} from "lucide-react";
import Layout from "@/components/Layout";
import { TeamForm } from "@/components/teams/TeamForm";
import { useEnterprisePermissions } from "@/hooks/useEnterprisePermissions";
import { api } from "@/services/api";
import { teamMembersApi } from "@/services/api/teams";
import { Team, TeamPlayer, TeamStaff } from "@/types/core";
import { Permission } from "@/store/types/permissions";
import { toast } from "@/hooks/use-toast";

const TeamDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasPermission } = useEnterprisePermissions();
  
  const [team, setTeam] = useState<Team | null>(null);
  const [players, setPlayers] = useState<TeamPlayer[]>([]);
  const [staff, setStaff] = useState<{ coaches: TeamStaff[]; managers: TeamStaff[] }>({ coaches: [], managers: [] });
  const [parents, setParents] = useState<TeamStaff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const canEditTeam = hasPermission('teams.edit' as Permission);
  const canDeleteTeam = hasPermission('teams.delete' as Permission);

  useEffect(() => {
    if (!id) {
      navigate("/teams");
      return;
    }
    loadTeamData();
  }, [id]);

  const loadTeamData = async () => {
    if (!id) return;
    
    setLoading(true);
    setError(null);

    try {
      const [teamData, playersData, staffData, parentsData] = await Promise.all([
        api.getTeamById(id),
        api.getTeamPlayers(id),
        api.getTeamStaff(id),
        api.getTeamParents(id)
      ]);

      if (!teamData) {
        throw new Error("Team not found");
      }

      setTeam(teamData);
      setPlayers(playersData);
      setStaff(staffData);
      setParents(parentsData);
      
      console.log('Team data loaded:', { team: teamData, players: playersData, staff: staffData, parents: parentsData });
    } catch (error) {
      console.error("Error loading team data:", error);
      setError(error instanceof Error ? error.message : "Failed to load team");
    } finally {
      setLoading(false);
    }
  };

  const handleSyncParents = async () => {
    setSyncing(true);
    try {
      await teamMembersApi.syncParentMemberships();
      toast({
        title: "Success",
        description: "Parent memberships synced successfully",
      });
      // Reload the team data to see updated parents
      await loadTeamData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sync parent memberships",
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  const handleEdit = (updatedTeam: Team) => {
    setTeam(updatedTeam);
    setIsEditing(false);
    toast({
      title: "Success",
      description: "Team updated successfully",
    });
  };

  const handleDelete = async () => {
    if (!team || !id) return;
    
    const confirmed = window.confirm(
      `Are you sure you want to delete "${team.name}"? This action cannot be undone.`
    );
    
    if (!confirmed) return;

    setDeleting(true);
    try {
      await api.deleteTeam(id);
      toast({
        title: "Success",
        description: "Team deleted successfully",
      });
      navigate("/teams");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete team",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </Layout>
    );
  }

  if (!team) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold">Team not found</h3>
          <Button onClick={() => navigate("/teams")} className="mt-4">
            Back to Teams
          </Button>
        </div>
      </Layout>
    );
  }

  if (isEditing) {
    return (
      <Layout>
        <div className="space-y-6">
          <Button
            variant="ghost"
            onClick={() => setIsEditing(false)}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Team Details
          </Button>
          
          <TeamForm 
            team={team}
            onSubmit={handleEdit}
            onCancel={() => setIsEditing(false)}
          />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/teams")}
              className="mt-1"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Teams
            </Button>
            
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold tracking-tight">{team.name}</h1>
                <Badge variant="secondary">{team.ageGroup}</Badge>
              </div>
              <p className="text-muted-foreground">
                {team.category} Team • {players.length} players
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleSyncParents}
              disabled={syncing}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? "Syncing..." : "Sync Parents"}
            </Button>
            {canEditTeam && (
              <Button
                variant="outline"
                onClick={() => setIsEditing(true)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            )}
            {canDeleteTeam && (
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleting}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {deleting ? "Deleting..." : "Delete"}
              </Button>
            )}
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="players">Players ({players.length})</TabsTrigger>
            <TabsTrigger value="staff">Staff ({staff.coaches.length + staff.managers.length})</TabsTrigger>
            <TabsTrigger value="parents">Parents ({parents.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Players</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{players.length}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Staff Members</CardTitle>
                  <UserCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{staff.coaches.length + staff.managers.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {staff.coaches.length} coaches, {staff.managers.length} managers
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Parent Contacts</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{parents.length}</div>
                </CardContent>
              </Card>
            </div>

            {team.description && (
              <Card>
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{team.description}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="players">
            <Card>
              <CardHeader>
                <CardTitle>Team Players</CardTitle>
                <CardDescription>
                  Manage players assigned to this team
                </CardDescription>
              </CardHeader>
              <CardContent>
                {players.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-2 text-sm font-semibold">No players yet</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Players will appear here once they're assigned to this team.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {players.map((player) => (
                      <div key={player.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <Users className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{player.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {player.dateOfBirth && `Born: ${player.dateOfBirth}`}
                            </p>
                          </div>
                        </div>
                        <Badge variant={player.status === 'approved' ? 'default' : 'secondary'}>
                          {player.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="staff">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Coaches ({staff.coaches.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {staff.coaches.length === 0 ? (
                    <p className="text-muted-foreground">No coaches assigned</p>
                  ) : (
                    <div className="space-y-3">
                      {staff.coaches.map((coach) => (
                        <div key={coach.id} className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <UserCheck className="h-4 w-4 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium">{coach.name}</p>
                            <p className="text-sm text-muted-foreground">{coach.email}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Managers ({staff.managers.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {staff.managers.length === 0 ? (
                    <p className="text-muted-foreground">No managers assigned</p>
                  ) : (
                    <div className="space-y-3">
                      {staff.managers.map((manager) => (
                        <div key={manager.id} className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <UserCheck className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">{manager.name}</p>
                            <p className="text-sm text-muted-foreground">{manager.email}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="parents">
            <Card>
              <CardHeader>
                <CardTitle>Parent Contacts</CardTitle>
                <CardDescription>
                  Parents and guardians of team players. If no parents appear, try clicking "Sync Parents" above.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {parents.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-2 text-sm font-semibold">No parent contacts</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Parent contacts will appear here once players are assigned to this team. Try clicking "Sync Parents" above.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {parents.map((parent) => (
                      <div key={parent.id} className="flex items-center gap-4 p-4 border rounded-lg">
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-orange-600" />
                        </div>
                        <div>
                          <p className="font-medium">{parent.name}</p>
                          <p className="text-sm text-muted-foreground">{parent.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default TeamDetailPage;
