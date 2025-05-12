
import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Event, Team } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Search, Filter } from "lucide-react";
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
import { eventApi, teamApi } from "@/services/api";

const EventsPage = () => {
  const { hasRole } = useAuth();
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
  
  // Get event type icon color
  const getEventTypeColor = (eventType: string): string => {
    switch (eventType) {
      case 'match':
        return 'bg-orange-100 text-orange-600';
      case 'training':
        return 'bg-blue-100 text-blue-600';
      default:
        return 'bg-purple-100 text-purple-600';
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <p>Loading events...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Events</h1>
            <p className="text-muted-foreground mt-1">
              View all upcoming events and matches
            </p>
          </div>
          
          {(hasRole("admin") || hasRole("coach") || hasRole("manager")) && (
            <Button className="bg-netball-500 hover:bg-netball-600" asChild>
              <Link to="/events/new">
                <Calendar className="mr-2 h-4 w-4" />
                Create New Event
              </Link>
            </Button>
          )}
        </div>
        
        {/* Search and filters */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search events by name or location..."
              className="pl-10"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div>
            <Collapsible open={showFilters} onOpenChange={setShowFilters}>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {filteredEvents.length} events
                </p>
                <CollapsibleTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="mr-2 h-4 w-4" />
                    Filters
                    {showFilters ? " ↑" : " ↓"}
                  </Button>
                </CollapsibleTrigger>
              </div>
              
              <CollapsibleContent className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="team-filter" className="text-sm font-medium">
                    Team
                  </label>
                  <Select
                    value={teamFilter}
                    onValueChange={setTeamFilter}
                  >
                    <SelectTrigger id="team-filter">
                      <SelectValue placeholder="Filter by team" />
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
                  <label htmlFor="type-filter" className="text-sm font-medium">
                    Event Type
                  </label>
                  <Select
                    value={typeFilter}
                    onValueChange={setTypeFilter}
                  >
                    <SelectTrigger id="type-filter">
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="training">Training</SelectItem>
                      <SelectItem value="match">Match</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>
        
        {/* Events list */}
        <div className="space-y-4">
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event) => (
              <Link key={event.id} to={`/events/${event.id}`} className="block hover:no-underline">
                <Card className="transition-all hover:shadow-md">
                  <CardContent className="p-0">
                    <div className="flex flex-col sm:flex-row">
                      <div className={`sm:w-20 p-4 flex items-center justify-center ${getEventTypeColor(event.eventType)}`}>
                        <Calendar className="h-6 w-6" />
                      </div>
                      <div className="p-4 flex-1 flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between">
                        <div>
                          <h3 className="font-semibold">{event.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {formatDateTime(event.date, event.time)}
                          </p>
                          <p className="text-sm mt-1">{event.location}</p>
                        </div>
                        <div className="mt-2 sm:mt-0 sm:text-right">
                          <span className="inline-block px-2 py-1 rounded-full bg-gray-100 text-xs font-medium">
                            {getTeamName(event.teamId)}
                          </span>
                          <p className="text-xs mt-2 text-muted-foreground capitalize">
                            {event.eventType}
                            {event.opponent && event.eventType === 'match' ? ` vs ${event.opponent}` : ''}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto text-gray-300" />
              <p className="mt-4 text-muted-foreground">No events found matching your criteria.</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => {
                  setSearchTerm("");
                  setTeamFilter("all");
                  setTypeFilter("all");
                }}
              >
                Clear filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default EventsPage;
