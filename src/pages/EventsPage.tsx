import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Plus, 
  Search,
  Filter,
  Play,
  Trophy,
  Target
} from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { format, isToday, isTomorrow, isPast } from "date-fns";

interface Event {
  id: string;
  title: string;
  event_type: string;
  event_date: string;
  location?: string | null;
  description?: string | null;
  team_id?: string | null;
  is_home?: boolean | null;
  teams?: {
    name: string;
    age_group: string;
  } | null;
  rsvp_count?: number;
}

interface DatabaseEvent {
  id: string;
  title: string;
  event_type: string;
  event_date: string;
  location: string | null;
  description: string | null;
  team_id: string | null;
  is_home: boolean | null;
}

interface DatabaseTeam {
  id: string;
  name: string;
  age_group: string;
}

const EventsPage = () => {
  const { hasRole } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("upcoming");

  const eventTypes = ["Training", "Match", "Tournament", "Social"];

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // First, get all events
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select(`
          id,
          title,
          event_type,
          event_date,
          location,
          description,
          team_id,
          is_home
        `)
        .order('event_date', { ascending: true });

      if (eventsError) throw eventsError;

      if (!eventsData) {
        setEvents([]);
        return;
      }

      // Get all unique team IDs
      const teamIds = [...new Set(eventsData.map(event => event.team_id).filter(Boolean))];
      
      // Get team information
      let teamsData: DatabaseTeam[] = [];
      if (teamIds.length > 0) {
        const { data: teams, error: teamsError } = await supabase
          .from('teams')
          .select('id, name, age_group')
          .in('id', teamIds);
        
        if (teamsError) {
          console.warn('Error loading teams:', teamsError);
        } else {
          teamsData = teams || [];
        }
      }

      // Get RSVP counts for all events
      const { data: rsvpData, error: rsvpError } = await supabase
        .from('event_responses')
        .select('event_id')
        .in('event_id', eventsData.map(e => e.id));

      if (rsvpError) {
        console.warn('Error loading RSVP data:', rsvpError);
      }

      // Count RSVPs per event
      const rsvpCounts = (rsvpData || []).reduce((acc, rsvp) => {
        acc[rsvp.event_id] = (acc[rsvp.event_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Combine all data
      const eventsWithDetails: Event[] = eventsData.map(event => {
        const team = teamsData.find(t => t.id === event.team_id);
        return {
          ...event,
          teams: team ? { name: team.name, age_group: team.age_group } : null,
          rsvp_count: rsvpCounts[event.id] || 0
        };
      });

      setEvents(eventsWithDetails);
    } catch (error) {
      console.error('Error loading events:', error);
      setError('Failed to load events. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'training': return Play;
      case 'match': return Trophy;
      case 'tournament': return Target;
      default: return Calendar;
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'training': return 'bg-blue-500/10 text-blue-600';
      case 'match': return 'bg-green-500/10 text-green-600';
      case 'tournament': return 'bg-purple-500/10 text-purple-600';
      default: return 'bg-gray-500/10 text-gray-600';
    }
  };

  const getDateBadge = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) return { text: "Today", variant: "default" as const };
    if (isTomorrow(date)) return { text: "Tomorrow", variant: "secondary" as const };
    if (isPast(date)) return { text: "Past", variant: "outline" as const };
    return null;
  };

  const filterEvents = (events: Event[], tab: string) => {
    const now = new Date();
    let filtered = events;

    // Filter by tab
    if (tab === "upcoming") {
      filtered = events.filter(event => new Date(event.event_date) >= now);
    } else if (tab === "past") {
      filtered = events.filter(event => new Date(event.event_date) < now);
    }

    // Filter by search and type
    filtered = filtered.filter(event => {
      const matchesSearch = searchTerm === "" || 
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.teams?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = selectedType === "all" || 
        event.event_type.toLowerCase() === selectedType.toLowerCase();
      
      return matchesSearch && matchesType;
    });

    return filtered;
  };

  const EventCard = ({ event }: { event: Event }) => {
    const EventIcon = getEventTypeIcon(event.event_type);
    const dateBadge = getDateBadge(event.event_date);
    
    return (
      <Card className="transition-all duration-300 hover:shadow-elevation-medium hover:-translate-y-1 cursor-pointer group">
        <Link to={`/events/${event.id}`}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3 flex-1">
                <div className={`p-2 rounded-lg ${getEventTypeColor(event.event_type)}`}>
                  <EventIcon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-lg group-hover:text-primary transition-colors truncate">
                    {event.title}
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {event.event_type}
                    </Badge>
                    {event.teams && (
                      <span className="text-xs text-muted-foreground">
                        {event.teams.name}
                      </span>
                    )}
                    {dateBadge && (
                      <Badge variant={dateBadge.variant} className="text-xs">
                        {dateBadge.text}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{format(new Date(event.event_date), 'MMM dd, HH:mm')}</span>
                </div>
                {event.location && (
                  <div className="flex items-center gap-1 min-w-0">
                    <MapPin className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{event.location}</span>
                  </div>
                )}
              </div>
              
              {event.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {event.description}
                </p>
              )}
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{event.rsvp_count || 0} responses</span>
                </div>
                
                {event.is_home !== null && (
                  <Badge variant={event.is_home ? "default" : "secondary"} className="text-xs">
                    {event.is_home ? "Home" : "Away"}
                  </Badge>
                )}
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
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Events</h1>
              <p className="text-muted-foreground mt-1">Loading club events...</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="space-y-2">
                    <div className="h-5 bg-muted rounded w-3/4"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded"></div>
                    <div className="h-4 bg-muted rounded w-2/3"></div>
                  </div>
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
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50 text-destructive" />
            <p className="text-lg font-medium mb-2">Failed to Load Events</p>
            <p className="text-muted-foreground text-center mb-6">{error}</p>
            <Button onClick={loadEvents}>
              Try Again
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const upcomingEvents = filterEvents(events, "upcoming");
  const pastEvents = filterEvents(events, "past");

  return (
    <Layout>
      <div className="space-y-6 sm:space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Events</h1>
            <p className="text-muted-foreground mt-1">
              Manage your club's {events.length} events
            </p>
          </div>
          
          {(hasRole('admin') || hasRole('coach') || hasRole('manager')) && (
            <Button asChild className="w-full sm:w-auto">
              <Link to="/events/new">
                <Plus className="h-4 w-4 mr-2" />
                Create Event
              </Link>
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              variant={selectedType === "all" ? "default" : "outline"}
              onClick={() => setSelectedType("all")}
              size="sm"
            >
              All
            </Button>
            {eventTypes.map(type => (
              <Button
                key={type}
                variant={selectedType === type ? "default" : "outline"}
                onClick={() => setSelectedType(type)}
                size="sm"
                className="hidden sm:inline-flex"
              >
                {type}
              </Button>
            ))}
          </div>
        </div>

        {/* Events Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upcoming">
              Upcoming ({upcomingEvents.length})
            </TabsTrigger>
            <TabsTrigger value="past">
              Past ({pastEvents.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="mt-6">
            {upcomingEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingEvents.map(event => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">No upcoming events</p>
                  <p className="text-muted-foreground text-center mb-6">
                    {searchTerm || selectedType !== "all" 
                      ? "Try adjusting your search or filters"
                      : "Get started by creating your first event"
                    }
                  </p>
                  {(hasRole('admin') || hasRole('coach') || hasRole('manager')) && (
                    <Button asChild>
                      <Link to="/events/new">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Your First Event
                      </Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="past" className="mt-6">
            {pastEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pastEvents.map(event => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">No past events</p>
                  <p className="text-muted-foreground text-center">
                    Past events will appear here once they're completed
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

export default EventsPage;
