
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { usePermissions } from "@/hooks/usePermissions";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Users, ChevronRight, Edit } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { groupApi, GroupWithTeams } from "@/services/api/groups";

const GroupsPage = () => {
  const { currentUser } = useAuth();
  const permissions = usePermissions();
  const [groups, setGroups] = useState<GroupWithTeams[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadGroups = async () => {
      try {
        const groupsData = await groupApi.getGroups();
        
        // Load full group data with teams for each group
        const groupsWithTeams = await Promise.all(
          groupsData.map(async (group) => {
            const fullGroup = await groupApi.getGroupById(group.id);
            return fullGroup || { ...group, teams: [], staff: [] };
          })
        );

        setGroups(groupsWithTeams);
      } catch (error) {
        console.error('Error loading groups:', error);
        toast.error('Failed to load groups');
      } finally {
        setLoading(false);
      }
    };

    loadGroups();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <p>Loading groups...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Age Groups</h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">
              Browse teams organized by age group
            </p>
          </div>
          
          {permissions.isAdmin && (
            <Button className="bg-primary hover:bg-primary/90 w-full sm:w-auto" asChild>
              <Link to="/groups/new">
                <Plus className="mr-2 h-4 w-4" />
                Create Group
              </Link>
            </Button>
          )}
        </div>
        
        {/* Groups Grid */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {groups.length > 0 ? (
            groups.map((group) => (
              <Card key={group.id} className="overflow-hidden hover:shadow-md transition-all">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={group.avatar_image} alt={group.name} />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {group.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-xl flex items-center gap-2">
                        {group.name}
                        {permissions.isAdmin && (
                          <Button variant="ghost" size="icon" className="h-6 w-6" asChild>
                            <Link to={`/groups/${group.id}/edit`}>
                              <Edit className="h-3 w-3" />
                            </Link>
                          </Button>
                        )}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {group.teams.length} {group.teams.length === 1 ? 'team' : 'teams'}
                      </p>
                    </div>
                  </div>
                  {group.description && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {group.description}
                    </p>
                  )}
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    {group.teams.length > 0 ? (
                      group.teams.map((team) => (
                        <Link 
                          key={team.id} 
                          to={`/teams/${team.id}`} 
                          className="hover:no-underline group"
                        >
                          <div className="flex items-center justify-between p-3 rounded-lg border transition-all hover:bg-accent/50 hover:border-primary/20">
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-primary" />
                              <span className="font-medium text-sm group-hover:text-primary transition-colors">
                                {team.name}
                              </span>
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                          </div>
                        </Link>
                      ))
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-sm text-muted-foreground">No teams in this group yet</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-8 sm:py-12">
              <p className="text-muted-foreground text-sm sm:text-base">No groups found.</p>
              {permissions.isAdmin && (
                <Button className="mt-4" asChild>
                  <Link to="/groups/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Create First Group
                  </Link>
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default GroupsPage;
