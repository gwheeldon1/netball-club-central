
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Users, Calendar, Award, AlertCircle } from "lucide-react";
import Layout from "@/components/Layout";
import { useEnterprisePermissions } from "@/hooks/useEnterprisePermissions";
import { api } from '@/services/api';
import { Team } from "@/types/core";
import { Permission } from '@/store/types/permissions';

const TeamsPage = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { hasPermission } = useEnterprisePermissions();

  useEffect(() => {
    const loadTeams = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log('Loading teams...');
        const teamsData = await api.getTeams();
        console.log('Teams loaded:', teamsData);
        setTeams(teamsData);
      } catch (error) {
        console.error("Error loading teams:", error);
        setError(error instanceof Error ? error.message : 'Failed to load teams');
      } finally {
        setLoading(false);
      }
    };

    loadTeams();
  }, []);

  const canCreateTeam = hasPermission('teams.create' as Permission);

  if (loading) {
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
          </div>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
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
          </div>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
          <Button 
            onClick={() => window.location.reload()}
            variant="outline"
          >
            Try Again
          </Button>
        </div>
      </Layout>
    );
  }

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

        {teams.length === 0 ? (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-semibold text-foreground">No teams found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Get started by creating your first team.
            </p>
            {canCreateTeam && (
              <div className="mt-6">
                <Button asChild>
                  <Link to="/teams/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Team
                  </Link>
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {teams.map((team) => (
              <Card key={team.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {team.name}
                    <Badge variant="secondary">{team.ageGroup}</Badge>
                  </CardTitle>
                  <CardDescription>
                    {team.category} Team
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {team.description || "No description available"}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>Players</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Events</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Award className="h-4 w-4" />
                      <span>Stats</span>
                    </div>
                  </div>
                  
                  <Button asChild variant="outline" className="w-full">
                    <Link to={`/teams/${team.id}`}>View Details</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default TeamsPage;
