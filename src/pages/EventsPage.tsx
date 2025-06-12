
import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Event, Team } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Search, Filter, AlertTriangle, Plus } from "lucide-react";
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
  
  // Get event type styling with improved colors
  const getEventTypeStyle = (eventType: string) => {
    switch (eventType) {
      case 'match':
        return {
          badge: 'bg-orange-500 text-white shadow-sm',
          icon: 'bg-orange-100 text-orange-600 border border-orange-200'
        };
      case 'training':
        return {
          badge: 'bg-blue-500 text-white shadow-sm',
          icon: 'bg-blue-100 text-blue-600 border border-blue-200'
        };
      default:
        return {
          badge: 'bg-purple-500 text-white shadow-sm',
          icon: 'bg-purple-100 text-purple-600 border border-purple-200'
        };
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-pulse flex flex-col items-center space-y-4">
            <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
            <div className="h-4 w-32 bg-gray-200 rounded"></div>
            <div className="h-3 w-24 bg-gray-100 rounded"></div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Events</h1>
            <p className="text-lg text-muted-foreground">
              View and manage all upcoming events and matches
            </p>
          </div>
          
          {(hasRole("admin") || hasRole("coach") || hasRole("manager")) && (
            <Button 
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all duration-200 font-medium" 
              size="lg"
              asChild
            >
              <Link to="/events/new">
                <Plus className="mr-2 h-5 w-5" />
                Create Event
              </Link>
            </Button>
          )}
        </div>
        
        {/* Offline Alert */}
        {isOffline && (
          <Alert className="bg-amber-50 border-amber-200 shadow-sm">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800 font-medium">
              You are offline. Events data may not be up to date.
            </AlertDescription>
          </Alert>
        )}
        
        {/* Search and Filters Section */}
        <div className="space-y-6">
          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search events or locations..."
              className="pl-10 h-12 text-base shadow-sm border-border focus:ring-2 focus:ring-primary/20"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Filter Controls */}
          <Collapsible open={showFilters} onOpenChange={setShowFilters}>
            <div className="flex items-center justify-between py-4 border-b border-border">
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">
                  {filteredEvents.length} events found
                </p>
                <p className="text-xs text-muted-foreground">
                  Use filters to narrow down results
                </p>
              </div>
              <CollapsibleTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 font-medium">
                  <Filter className="h-4 w-4" />
                  Filters
                  <span className="text-xs text-muted-foreground ml-1">
                    {showFilters ? "↑" : "↓"}
                  </span>
                </Button>
              </CollapsibleTrigger>
            </div>
            
            <CollapsibleContent className="pt-6">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-3">
                  <label htmlFor="team-filter" className="text-sm font-medium text-foreground">
                    Filter by Team
                  </label>
                  <Select value={teamFilter} onValueChange={setTeamFilter}>
                    <SelectTrigger id="team-filter" className="h-11 shadow-sm">
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
                
                <div className="space-y-3">
                  <label htmlFor="type-filter" className="text-sm font-medium text-foreground">
                    Filter by Type
                  </label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger id="type-filter" className="h-11 shadow-sm">
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
                
                {(teamFilter !== "all" || typeFilter !== "all" || searchTerm) && (
                  <div className="flex items-end">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchTerm("");
                        setTeamFilter("all");
                        setTypeFilter("all");
                      }}
                      className="h-11 w-full sm:w-auto"
                    >
                      Clear Filters
                    </Button>
                  </div>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
        
        {/* Events List */}
        <div className="space-y-4">
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event) => {
              const eventStyle = getEventTypeStyle(event.eventType);
              return (
                <Link key={event.id} to={`/events/${event.id}`} className="block group">
                  <Card className="transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 border-border bg-card">
                    <CardContent className="p-0">
                      <div className="flex">
                        {/* Event Type Indicator */}
                        <div className={`w-20 flex items-center justify-center ${eventStyle.icon}`}>
                          <Calendar className="h-6 w-6" />
                        </div>
                        
                        {/* Event Details */}
                        <div className="flex-1 p-6">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                            <div className="space-y-3">
                              <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                  <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${eventStyle.badge}`}>
                                    {event.eventType}
                                  </span>
                                  {event.eventType === 'match' && event.opponent && (
                                    <span className="text-sm text-muted-foreground">
                                      vs {event.opponent}
                                    </span>
                                  )}
                                </div>
                                <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                                  {event.name}
                                </h3>
                              </div>
                              
                              <div className="space-y-1">
                                <p className="text-sm font-medium text-foreground">
                                  {formatDateTime(event.date, event.time)}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {event.location}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex-shrink-0">
                              <span className="inline-flex items-center px-3 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium">
                                {getTeamName(event.teamId)}
                              </span>
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
            <div className="text-center py-16">
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
                  <Calendar className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-foreground">No events found</h3>
                  <p className="text-muted-foreground max-w-sm mx-auto">
                    {searchTerm || teamFilter !== "all" || typeFilter !== "all" 
                      ? "Try adjusting your search or filter criteria."
                      : "There are no events scheduled at the moment."
                    }
                  </p>
                </div>
                {(searchTerm || teamFilter !== "all" || typeFilter !== "all") && (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchTerm("");
                      setTeamFilter("all");
                      setTypeFilter("all");
                    }}
                    className="mt-4"
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
