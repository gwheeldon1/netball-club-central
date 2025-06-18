
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Team } from "@/types";
import { api } from "@/services/api";

interface AgeGroup {
  ageGroup: string;
  teams: Team[];
}

const GroupsPage = () => {
  const { currentUser } = useAuth();
  const [ageGroups, setAgeGroups] = useState<AgeGroup[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadTeamsAndGroupByAge = async () => {
      try {
        const teamsData = await api.getTeams();
        
        // Group teams by age group
        const groupedTeams = teamsData.reduce((acc: { [key: string]: Team[] }, team) => {
          if (!acc[team.ageGroup]) {
            acc[team.ageGroup] = [];
          }
          acc[team.ageGroup].push(team);
          return acc;
        }, {});

        // Convert to array and sort by age group
        const ageGroupsArray = Object.keys(groupedTeams)
          .sort()
          .map(ageGroup => ({
            ageGroup,
            teams: groupedTeams[ageGroup].sort((a, b) => a.name.localeCompare(b.name))
          }));

        setAgeGroups(ageGroupsArray);
      } catch (error) {
        console.error('Error loading teams:', error);
        toast.error('Failed to load age groups');
      } finally {
        setLoading(false);
      }
    };

    loadTeamsAndGroupByAge();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <p>Loading age groups...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col gap-3 sm:gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Age Groups</h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">
              Browse teams organized by age group
            </p>
          </div>
        </div>
        
        {/* Age Groups */}
        <div className="space-y-4 sm:space-y-6">
          {ageGroups.length > 0 ? (
            ageGroups.map((group) => (
              <Card key={group.ageGroup} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    {group.ageGroup}
                    <span className="text-sm text-muted-foreground font-normal">
                      ({group.teams.length} {group.teams.length === 1 ? 'team' : 'teams'})
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {group.teams.map((team) => (
                      <Link 
                        key={team.id} 
                        to={`/teams/${team.id}`} 
                        className="hover:no-underline group"
                      >
                        <Card className="h-full transition-all hover:shadow-md border-2 border-transparent group-hover:border-primary/20">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                                  <Users className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                  <h3 className="font-semibold text-base group-hover:text-primary transition-colors">
                                    {team.name}
                                  </h3>
                                  <p className="text-sm text-muted-foreground">
                                    {team.description || 'Team details'}
                                  </p>
                                </div>
                              </div>
                              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-8 sm:py-12">
              <p className="text-muted-foreground text-sm sm:text-base">No age groups found.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default GroupsPage;
