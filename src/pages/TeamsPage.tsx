
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Trophy, 
  Users, 
  Plus, 
  Search, 
  Filter,
  MapPin,
  Calendar,
  Star
} from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface Team {
  id: string;
  name: string;
  age_group: string;
  description?: string;
  season_year?: number;
  created_at: string;
  player_count?: number;
}

const TeamsPage = () => {
  const { hasRole } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<string>("all");

  const ageGroups = ["U8", "U10", "U12", "U14", "U16", "U18", "Senior"];

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('teams')
        .select(`
          *,
          player_teams!inner(count)
        `)
        .eq('archived', false)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform data to include player count
      const teamsWithCounts = data?.map(team => ({
        ...team,
        player_count: team.player_teams?.length || 0
      })) || [];

      setTeams(teamsWithCounts);
    } catch (error) {
      console.error('Error loading teams:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTeams = teams.filter(team => {
    const matchesSearch = searchTerm === "" || 
      team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.age_group.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAgeGroup = selectedAgeGroup === "all" || team.age_group === selectedAgeGroup;
    
    return matchesSearch && matchesAgeGroup;
  });

  const TeamCard = ({ team }: { team: Team }) => (
    <Card className="transition-all duration-300 hover:shadow-elevation-medium hover:-translate-y-1 cursor-pointer group">
      <Link to={`/teams/${team.id}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {team.name.split(' ').map(word => word[0]).join('').slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg group-hover:text-primary transition-colors">
                  {team.name}
                </CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    {team.age_group}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {team.season_year || new Date().getFullYear()} Season
                  </span>
                </div>
              </div>
            </div>
            <Trophy className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {team.description && (
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
              {team.description}
            </p>
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{team.player_count || 0} players</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Active</span>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">4.8</span>
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  );

  if (loading) {
    return (
      <Layout>
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Teams</h1>
              <p className="text-muted-foreground mt-1">Manage your club's teams</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 bg-muted rounded-full"></div>
                    <div className="space-y-2">
                      <div className="h-5 bg-muted rounded w-32"></div>
                      <div className="h-4 bg-muted rounded w-20"></div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded"></div>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 sm:space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Teams</h1>
            <p className="text-muted-foreground mt-1">
              Manage your club's {teams.length} active teams
            </p>
          </div>
          
          {hasRole('admin') && (
            <Button asChild className="w-full sm:w-auto">
              <Link to="/teams/new">
                <Plus className="h-4 w-4 mr-2" />
                Create Team
              </Link>
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search teams..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              variant={selectedAgeGroup === "all" ? "default" : "outline"}
              onClick={() => setSelectedAgeGroup("all")}
              size="sm"
            >
              All
            </Button>
            {ageGroups.map(age => (
              <Button
                key={age}
                variant={selectedAgeGroup === age ? "default" : "outline"}
                onClick={() => setSelectedAgeGroup(age)}
                size="sm"
                className="hidden sm:inline-flex"
              >
                {age}
              </Button>
            ))}
          </div>
        </div>

        {/* Teams Grid */}
        {filteredTeams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTeams.map(team => (
              <TeamCard key={team.id} team={team} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No teams found</p>
              <p className="text-muted-foreground text-center mb-6">
                {searchTerm || selectedAgeGroup !== "all" 
                  ? "Try adjusting your search or filters"
                  : "Get started by creating your first team"
                }
              </p>
              {hasRole('admin') && (
                <Button asChild>
                  <Link to="/teams/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Team
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default TeamsPage;
