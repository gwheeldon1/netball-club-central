
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Layout from "@/components/Layout";
import { teamApi, childrenApi } from "@/services/api";
import { Team } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import { Link } from "react-router-dom";

const TeamsPage = () => {
  const { hasRole } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [filteredTeams, setFilteredTeams] = useState<Team[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [loading, setLoading] = useState(true);
  
  const filterCategories = ["All", "Junior", "Senior", "Mixed"];
  
  // Load teams data
  useEffect(() => {
    const loadTeams = async () => {
      try {
        const teamsData = teamApi.getAll();
        
        // Enhance teams with player count
        const enhancedTeams = teamsData.map(team => {
          const players = childrenApi.getByTeamId(team.id);
          return {
            ...team,
            players: players
          };
        });
        
        setTeams(enhancedTeams);
        setFilteredTeams(enhancedTeams);
      } catch (error) {
        console.error("Error loading teams:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadTeams();
  }, []);
  
  // Filter teams by category
  const filterTeamsByCategory = (category: string) => {
    setActiveCategory(category);
    
    if (category === "All") {
      setFilteredTeams(teams);
    } else {
      const filtered = teams.filter((team) => team.category === category);
      setFilteredTeams(filtered);
    }
  };

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
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Teams</h1>
            <p className="text-muted-foreground mt-1">
              View and manage all teams in your netball club
            </p>
          </div>
          
          {hasRole("admin") && (
            <Button className="bg-netball-500 hover:bg-netball-600" asChild>
              <Link to="/teams/new">
                <Users className="mr-2 h-4 w-4" />
                Create New Team
              </Link>
            </Button>
          )}
        </div>
        
        {/* Category filter */}
        <div className="flex flex-wrap gap-2">
          {filterCategories.map((category) => (
            <Button
              key={category}
              variant={activeCategory === category ? "default" : "outline"}
              onClick={() => filterTeamsByCategory(category)}
              className={activeCategory === category ? "bg-netball-500 hover:bg-netball-600" : ""}
            >
              {category}
            </Button>
          ))}
        </div>
        
        {/* Teams grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTeams.length > 0 ? (
            filteredTeams.map((team) => (
              <Link key={team.id} to={`/teams/${team.id}`} className="hover:no-underline">
                <Card className="h-full transition-all hover:shadow-md overflow-hidden">
                  {team.bannerImage && (
                    <div className="h-40 w-full overflow-hidden">
                      <img 
                        src={team.bannerImage} 
                        alt={team.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader className="flex flex-row items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-gray-100">
                      <img 
                        src={team.icon || team.profileImage || "/placeholder.svg"} 
                        alt="" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{team.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{team.ageGroup} • {team.category}</p>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {team.description && (
                      <p className="text-sm line-clamp-2 text-gray-600">
                        {team.description}
                      </p>
                    )}
                    <div className="mt-3 flex items-center gap-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {team.players?.length || 0} players
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">No teams found for this category.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default TeamsPage;
