
import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Event, Team } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Search, Filter, AlertTriangle, Plus, MapPin, Clock, RotateCcw } from "lucide-react";
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
import { api } from '@/services/unifiedApi';
import { useIsMobile } from "@/hooks/use-mobile";
import { logger } from '@/utils/logger';

const EventsPage = () => {
  const { hasRole } = useAuth();
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
        const eventsData = await api.getEvents();
        const teamsData = await api.getTeams();
        
        setEvents(eventsData);
        setFilteredEvents(eventsData);
        setTeams(teamsData);
      } catch (error) {
        logger.error("Error loading events data:", error);
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
  
  // Get event type styling
  const getEventTypeStyle = (eventType: string) => {
    switch (eventType) {
      case 'match':
        return {
          badge: 'bg-primary/10 text-primary border border-primary/20',
          dot: 'bg-primary',
          icon: Calendar
        };
      case 'training':
        return {
          badge: 'bg-muted text-muted-foreground border border-border',
          dot: 'bg-muted-foreground',
          icon: Clock
        };
      default:
        return {
          badge: 'bg-muted text-muted-foreground border border-border',
          dot: 'bg-muted-foreground',
          icon: Calendar
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
        {/* Header Section */}
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
        
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search events or locations..."
              className="pl-10"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          
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
        
        {/* Events List - improved for mobile/tablet with varied layouts */}
        <div className="space-y-3">
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event, index) => {
              const eventStyle = getEventTypeStyle(event.eventType);
              const IconComponent = eventStyle.icon;
              
              return (
                <Link key={event.id} to={`/events/${event.id}`} className="block">
                  <Card className="transition-all duration-200 hover:shadow-md border-border hover:border-primary/20">
                    <CardContent className="p-4">
                      {/* Mobile/Tablet optimized layout */}
                      <div className="flex flex-col space-y-3 md:flex-row md:items-center md:space-y-0 md:space-x-4">
                        {/* Left side - Event type and icon */}
                        <div className="flex items-center space-x-3 md:flex-col md:items-center md:space-x-0 md:space-y-2 md:w-20 md:flex-shrink-0">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-primary/10 text-primary">
                            <IconComponent className="h-5 w-5" />
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${eventStyle.badge} md:text-center`}>
                            {event.eventType}
                          </span>
                        </div>
                        
                        {/* Main content */}
                        <div className="flex-1 space-y-2">
                          <div className="flex flex-col space-y-1 md:flex-row md:items-start md:justify-between md:space-y-0">
                            <div className="space-y-1">
                              <h3 className="font-semibold text-foreground text-base leading-tight">
                                {event.name}
                              </h3>
                              {event.eventType === 'match' && event.opponent && (
                                <p className="text-sm text-muted-foreground">
                                  vs {event.opponent}
                                </p>
                              )}
                            </div>
                            
                            <div className="flex-shrink-0 self-start">
                              <span className="inline-block px-2 py-1 bg-muted text-muted-foreground text-xs rounded-md">
                                {getTeamName(event.teamId)}
                              </span>
                            </div>
                          </div>
                          
                          {/* Event details */}
                          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 flex-shrink-0" />
                              <span className="truncate">{formatDateTime(event.date, event.time)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 flex-shrink-0" />
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
