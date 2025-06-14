
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { usePermissions } from "@/hooks/usePermissions";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Team } from "@/types";
import { api } from "@/services/unifiedApi";

const TeamsPage = () => {
  const { currentUser } = useAuth();
  const permissions = usePermissions();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadTeams = async () => {
      try {
        const teamsData = await api.getTeams();
        setTeams(teamsData);
      } catch (error) {
        console.error('Error loading teams:', error);
        toast.error('Failed to load teams');
      } finally {
        setLoading(false);
      }
    };

    loadTeams();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <p>Loading teams...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Teams</h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">
              {permissions.isAdmin 
                ? "Manage all teams and their members"
                : permissions.userTeams.length > 0
                ? "Teams you coach or manage"
                : "Browse available teams"}
            </p>
          </div>
          
          {permissions.isAdmin && (
            <Button className="bg-primary hover:bg-primary/90 w-full sm:w-auto" asChild>
              <Link to="/teams/new">
                <Plus className="mr-2 h-4 w-4" />
                Create Team
              </Link>
            </Button>
          )}
        </div>
        
        {/* Teams grid */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {teams.length > 0 ? (
            teams.map((team) => (
              <Link key={team.id} to={`/teams/${team.id}`} className="hover:no-underline">
                <Card className="h-full transition-all hover:shadow-md overflow-hidden">
                  <CardHeader className="flex flex-row items-center gap-3 p-4 sm:p-6">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden flex-shrink-0 bg-accent flex items-center justify-center">
                      <Users className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-lg sm:text-xl truncate">{team.name}</CardTitle>
                      <p className="text-sm text-muted-foreground truncate">{team.ageGroup}</p>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 pt-0">
                    <div className="mt-2 sm:mt-3 flex items-center gap-1">
                      <Users className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
                      <span className="text-xs sm:text-sm text-muted-foreground">Team Details</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          ) : (
            <div className="col-span-full text-center py-8 sm:py-12">
              <p className="text-muted-foreground text-sm sm:text-base">No teams found.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default TeamsPage;
