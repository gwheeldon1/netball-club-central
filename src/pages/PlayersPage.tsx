
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Search, 
  Filter,
  Plus,
  Calendar,
  Mail,
  Phone,
  MapPin,
  CheckCircle,
  Clock,
  XCircle
} from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface Player {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  date_of_birth?: string;
  approval_status: string;
  created_at: string;
  teams?: Array<{
    name: string;
    age_group: string;
  }>;
}

const PlayersPage = () => {
  const { hasRole } = useAuth();
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("all");

  const statusOptions = [
    { value: "all", label: "All Players" },
    { value: "approved", label: "Approved" },
    { value: "pending", label: "Pending" },
    { value: "rejected", label: "Rejected" }
  ];

  useEffect(() => {
    loadPlayers();
  }, []);

  const loadPlayers = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('players')
        .select(`
          *,
          player_teams!inner(
            teams!inner(name, age_group)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform data to include teams
      const playersWithTeams = data?.map(player => ({
        ...player,
        teams: player.player_teams?.map(pt => pt.teams) || []
      })) || [];

      setPlayers(playersWithTeams);
    } catch (error) {
      console.error('Error loading players:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return { variant: 'default' as const, icon: CheckCircle, color: 'text-green-600' };
      case 'pending':
        return { variant: 'secondary' as const, icon: Clock, color: 'text-yellow-600' };
      case 'rejected':
        return { variant: 'destructive' as const, icon: XCircle, color: 'text-red-600' };
      default:
        return { variant: 'outline' as const, icon: Clock, color: 'text-gray-600' };
    }
  };

  const filterPlayers = (players: Player[], tab: string) => {
    let filtered = players;

    // Filter by tab
    if (tab !== "all") {
      filtered = players.filter(player => player.approval_status === tab);
    }

    // Filter by search and status
    filtered = filtered.filter(player => {
      const matchesSearch = searchTerm === "" || 
        player.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        player.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        player.email?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = selectedStatus === "all" || player.approval_status === selectedStatus;
      
      return matchesSearch && matchesStatus;
    });

    return filtered;
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const PlayerCard = ({ player }: { player: Player }) => {
    const statusBadge = getStatusBadge(player.approval_status);
    const StatusIcon = statusBadge.icon;
    
    return (
      <Card className="transition-all duration-300 hover:shadow-elevation-medium hover:-translate-y-1 cursor-pointer group">
        <Link to={`/players/${player.id}`}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3 flex-1">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {player.first_name[0]}{player.last_name[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-lg group-hover:text-primary transition-colors">
                    {player.first_name} {player.last_name}
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={statusBadge.variant} className="text-xs">
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {player.approval_status}
                    </Badge>
                    {player.date_of_birth && (
                      <span className="text-xs text-muted-foreground">
                        Age {calculateAge(player.date_of_birth)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {/* Contact Info */}
              <div className="space-y-1">
                {player.email && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span className="truncate">{player.email}</span>
                  </div>
                )}
                {player.phone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{player.phone}</span>
                  </div>
                )}
              </div>

              {/* Teams */}
              {player.teams && player.teams.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {player.teams.map((team, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {team.name} ({team.age_group})
                    </Badge>
                  ))}
                </div>
              )}

              {/* Registration Date */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Registered {format(new Date(player.created_at), 'MMM dd, yyyy')}</span>
              </div>
            </div>
          </CardContent>
        </Link>
      </Card>
    );
  };

  if (loading) {
    return (
      <Layout>
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Players</h1>
              <p className="text-muted-foreground mt-1">Manage club players</p>
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

  const allPlayers = filterPlayers(players, "all");
  const approvedPlayers = filterPlayers(players, "approved");
  const pendingPlayers = filterPlayers(players, "pending");
  const rejectedPlayers = filterPlayers(players, "rejected");

  return (
    <Layout>
      <div className="space-y-6 sm:space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Players</h1>
            <p className="text-muted-foreground mt-1">
              Manage your club's {players.length} registered players
            </p>
          </div>
          
          {hasRole('admin') && (
            <Button asChild className="w-full sm:w-auto">
              <Link to="/players/new">
                <Plus className="h-4 w-4 mr-2" />
                Add Player
              </Link>
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search players..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Players Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">
              All ({allPlayers.length})
            </TabsTrigger>
            <TabsTrigger value="approved">
              Approved ({approvedPlayers.length})
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pending ({pendingPlayers.length})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Rejected ({rejectedPlayers.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            {allPlayers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allPlayers.map(player => (
                  <PlayerCard key={player.id} player={player} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">No players found</p>
                  <p className="text-muted-foreground text-center mb-6">
                    {searchTerm 
                      ? "Try adjusting your search terms"
                      : "Players will appear here once they register"
                    }
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="approved" className="mt-6">
            {approvedPlayers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {approvedPlayers.map(player => (
                  <PlayerCard key={player.id} player={player} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50 text-green-600" />
                  <p className="text-lg font-medium mb-2">No approved players</p>
                  <p className="text-muted-foreground text-center">
                    Approved players will appear here
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="pending" className="mt-6">
            {pendingPlayers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pendingPlayers.map(player => (
                  <PlayerCard key={player.id} player={player} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50 text-yellow-600" />
                  <p className="text-lg font-medium mb-2">No pending approvals</p>
                  <p className="text-muted-foreground text-center">
                    Player registrations awaiting approval will appear here
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="rejected" className="mt-6">
            {rejectedPlayers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rejectedPlayers.map(player => (
                  <PlayerCard key={player.id} player={player} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <XCircle className="h-12 w-12 mx-auto mb-4 opacity-50 text-red-600" />
                  <p className="text-lg font-medium mb-2">No rejected players</p>
                  <p className="text-muted-foreground text-center">
                    Rejected player registrations will appear here
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default PlayersPage;
