import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Users, Calendar, Award } from "lucide-react";
import Layout from "@/components/Layout";
import { useEnterprisePermissions } from "@/hooks/useEnterprisePermissions";
import { api } from '@/services/api';
import { Team } from "@/types";
import { Permission } from '@/store/types/permissions';

const TeamsPage = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const { hasPermission } = useEnterprisePermissions();

  useEffect(() => {
    const loadTeams = async () => {
      setLoading(true);
      try {
        const teamsData = await api.getTeams();
        setTeams(teamsData);
      } catch (error) {
        console.error("Error loading teams:", error);
      } finally {
        setLoading(false);
      }
    };

    loadTeams();
  }, []);

  const canCreateTeam = hasPermission('teams.create' as Permission);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Teams</h1>
            <p className="text-muted-foreground">
              Manage your teams and track their progress
            </p>
          </div>
          {canCreateTeam && (
            <Button asChild>
              <Link to="/teams/new">
                <Plus className="mr-2 h-4 w-4" />
                New Team
              </Link>
            </Button>
          )}
        </div>

        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <p>Loading teams...</p>
          ) : (
            teams.map((team) => (
              <Card key={team.id}>
                <CardHeader>
                  <CardTitle>{team.name}</CardTitle>
                  <CardDescription>
                    <Badge variant="secondary">{team.ageGroup}</Badge>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {team.description || "No description available"}
                  </p>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <span className="text-sm text-gray-500">12 Players</span>
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm text-gray-500">Next Match: July 22</span>
                    <Award className="h-4 w-4" />
                    <span className="text-sm text-gray-500">Rank: 3rd</span>
                  </div>
                  <Button asChild variant="link">
                    <Link to={`/teams/${team.id}`}>View Details</Link>
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};

export default TeamsPage;
