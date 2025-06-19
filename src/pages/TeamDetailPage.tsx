
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, UserPlus, Settings } from "lucide-react";
import Layout from "@/components/Layout";
import { api } from '@/services/apiService';
import { Team, TeamPlayer, TeamStaff } from "@/types/core";

const TeamDetailPage = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const [team, setTeam] = useState<Team | null>(null);
  const [players, setPlayers] = useState<TeamPlayer[]>([]);
  const [coaches, setCoaches] = useState<TeamStaff[]>([]);
  const [managers, setManagers] = useState<TeamStaff[]>([]);
  const [parents, setParents] = useState<TeamStaff[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTeamData = async () => {
      if (!teamId) {
        navigate('/teams');
        return;
      }

      setLoading(true);
      try {
        // Load team details
        const teamData = await api.getTeamById(teamId);
        if (!teamData) {
          navigate('/teams');
          return;
        }
        setTeam(teamData);

        // Load team members
        const [playersData, staffData, parentsData] = await Promise.all([
          api.getTeamPlayers(teamId),
          api.getTeamStaff(teamId),
          api.getTeamParents(teamId)
        ]);

        setPlayers(playersData);
        setCoaches(staffData.coaches);
        setManagers(staffData.managers);
        setParents(parentsData);
      } catch (error) {
        console.error("Error loading team data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadTeamData();
  }, [teamId, navigate]);

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
        <div className="flex items-center justify-center h-64">
          <p>Team not found</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight">{team.name}</h1>
            <p className="text-muted-foreground">{team.ageGroup} Team</p>
          </div>
          <Button variant="outline" onClick={() => navigate(`/teams/${teamId}/edit`)}>
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div>

        {team.description && (
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{team.description}</p>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Players ({players.length})
              </CardTitle>
              <Button size="sm" variant="outline">
                <UserPlus className="mr-2 h-4 w-4" />
                Add Player
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {players.map((player) => (
                  <div key={player.id} className="flex items-center gap-3 p-2 rounded-lg border">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">
                        {player.name.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{player.name}</p>
                      {player.dateOfBirth && (
                        <p className="text-sm text-muted-foreground">
                          Born: {new Date(player.dateOfBirth).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                {players.length === 0 && (
                  <p className="text-muted-foreground text-center py-4">No players yet</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Staff & Parents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {coaches.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-2">COACHES</h4>
                    <div className="space-y-2">
                      {coaches.map((coach) => (
                        <div key={coach.id} className="flex items-center gap-3 p-2 rounded-lg border">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600">
                              {coach.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{coach.name}</p>
                            <p className="text-sm text-muted-foreground">{coach.email}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {managers.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-2">MANAGERS</h4>
                    <div className="space-y-2">
                      {managers.map((manager) => (
                        <div key={manager.id} className="flex items-center gap-3 p-2 rounded-lg border">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-green-600">
                              {manager.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{manager.name}</p>
                            <p className="text-sm text-muted-foreground">{manager.email}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {parents.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-2">
                      PARENTS ({parents.length})
                    </h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {parents.map((parent) => (
                        <div key={parent.id} className="flex items-center gap-3 p-2 rounded-lg border">
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-purple-600">
                              {parent.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{parent.name}</p>
                            <p className="text-sm text-muted-foreground">{parent.email}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {coaches.length === 0 && managers.length === 0 && parents.length === 0 && (
                  <p className="text-muted-foreground text-center py-4">No staff or parents yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default TeamDetailPage;
