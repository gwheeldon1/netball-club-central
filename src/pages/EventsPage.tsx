
import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Event, Team } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Search, Filter, AlertTriangle, Plus, MapPin, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { eventApi, teamApi } from "@/services/api";
import { useIsMobile } from "@/hooks/use-mobile";
import { useOffline } from "@/hooks/use-offline";

const EventsPage = () => {
  const { hasRole, isOffline } = useAuth();
  const isMobile = useIsMobile();
  const [events, setEvents] = useState<Event[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [teamFilter, setTeamFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  
  // Load events and teams data
  useEffect(() => {
    const loadData = async () => {
      try {
        const eventsData = eventApi.getAll();
        const teamsData = teamApi.getAll();
        
        setEvents(eventsData);
        setFilteredEvents(eventsData);
        setTeams(teamsData);
      } catch (error) {
        console.error("Error loading events data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  useEffect(() => {
    // Apply filters
    let filtered = [...events];
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        event => 
          event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply team filter
    if (teamFilter !== "all") {
      filtered = filtered.filter(event => event.teamId === teamFilter);
    }
    
    // Apply event type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter(event => event.eventType === typeFilter);
    }
    
    setFilteredEvents(filtered);
  }, [searchTerm, teamFilter, typeFilter, events]);
  
  // Get event team name
  const getTeamName = (teamId: string) => {
    const team = teams.find(t => t.id === teamId);
    return team ? team.name : "Unknown Team";
  };
  
  // Format event date and time
  const formatDateTime = (date: string, time: string) => {
    return new Date(`${date}T${time}`).toLocaleString('en-GB', { 
      dateStyle: 'medium', 
      timeStyle: 'short' 
    });
  };
  
  // Get event type styling - simplified to use design system colors only
  const getEventTypeStyle = (eventType: string) => {
    switch (eventType) {
      case 'match':
        return {
          badge: 'bg-primary text-primary-foreground',
          dot: 'bg-primary'
        };
      case 'training':
        return {
          badge: 'bg-secondary text-secondary-foreground',
          dot: 'bg-secondary'
        };
      default:
        return {
          badge: 'bg-muted text-muted-foreground',
          dot: 'bg-muted-foreground'
        };
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-pulse flex flex-col items-center space-y-4">
            <div className="h-8 w-8 bg-muted rounded-full"></div>
            <div className="h-4 w-32 bg-muted rounded"></div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header Section - Mobile optimized */}
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Events</h1>
            <p className="text-sm text-muted-foreground sm:text-base">
              View and manage all upcoming events and matches
            </p>
          </div>
          
          {(hasRole("admin") || hasRole("coach") || hasRole("manager")) && (
            <Button 
              className="w-full sm:w-auto" 
              asChild
            >
              <Link to="/events/new">
                <Plus className="mr-2 h-4 w-4" />
                Create Event
              </Link>
            </Button>
          )}
        </div>
        
        {/* Offline Alert */}
        {isOffline && (
          <Alert className="bg-background border-border">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              You are offline. Events data may not be up to date.
            </AlertDescription>
          </Alert>
        )}
        
        {/* Search and Filters Section */}
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search events or locations..."
              className="pl-10"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Filter Controls */}
          <Collapsible open={showFilters} onOpenChange={setShowFilters}>
            <div className="flex items-center justify-between py-3 border-b border-border">
              <div>
                <p className="text-sm font-medium">
                  {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''} found
                </p>
              </div>
              <CollapsibleTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  Filters
                </Button>
              </CollapsibleTrigger>
            </div>
            
            <CollapsibleContent className="pt-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Team</label>
                  <Select value={teamFilter} onValueChange={setTeamFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All teams" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Teams</SelectItem>
                      {teams.map((team) => (
                        <SelectItem key={team.id} value={team.id}>
                          {team.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Type</label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="training">Training</SelectItem>
                      <SelectItem value="match">Match</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {(teamFilter !== "all" || typeFilter !== "all" || searchTerm) && (
                <div className="mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchTerm("");
                      setTeamFilter("all");
                      setTypeFilter("all");
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
        </div>
        
        {/* Events List */}
        <div className="space-y-3">
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event) => {
              const eventStyle = getEventTypeStyle(event.eventType);
              return (
                <Link key={event.id} to={`/events/${event.id}`} className="block">
                  <Card className="transition-all duration-200 hover:shadow-md border-border">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-4">
                        {/* Event Type Indicator */}
                        <div className="flex-shrink-0 mt-1">
                          <div className={`w-3 h-3 rounded-full ${eventStyle.dot}`}></div>
                        </div>
                        
                        {/* Event Details */}
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${eventStyle.badge}`}>
                                  {event.eventType}
                                </span>
                                {event.eventType === 'match' && event.opponent && (
                                  <span className="text-sm text-muted-foreground">
                                    vs {event.opponent}
                                  </span>
                                )}
                              </div>
                              <h3 className="font-semibold text-foreground truncate">
                                {event.name}
                              </h3>
                            </div>
                            
                            <div className="flex-shrink-0">
                              <span className="inline-block px-2 py-1 bg-muted text-muted-foreground text-xs rounded">
                                {getTeamName(event.teamId)}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>{formatDateTime(event.date, event.time)}</span>
                            </div>
                            <div className="hidden sm:block text-muted-foreground">•</div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              <span className="truncate">{event.location}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })
          ) : (
            <div className="text-center py-12">
              <div className="space-y-3">
                <div className="w-12 h-12 mx-auto bg-muted rounded-full flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-medium">No events found</h3>
                  <p className="text-sm text-muted-foreground">
                    {searchTerm || teamFilter !== "all" || typeFilter !== "all" 
                      ? "Try adjusting your search or filter criteria."
                      : "There are no events scheduled at the moment."
                    }
                  </p>
                </div>
                {(searchTerm || teamFilter !== "all" || typeFilter !== "all") && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setSearchTerm("");
                      setTeamFilter("all");
                      setTypeFilter("all");
                    }}
                  >
                    Clear all filters
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default EventsPage;
