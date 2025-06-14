import React, { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CalendarCheck, UserCheck, UserX, HelpCircle, Clock, Users } from 'lucide-react';

interface Event {
  id: string;
  title: string;
  event_date: string;
  event_type: string;
  location?: string;
  teams?: { name: string; age_group: string };
}

interface EventResponse {
  id: string;
  player_id: string;
  event_id: string;
  rsvp_status: 'going' | 'not_going' | 'maybe';
  response_date: string;
  players: {
    id: string;
    first_name: string;
    last_name: string;
  };
}

interface EnhancedRSVPProps {
  playerId?: string;
  eventId?: string;
  showAllEvents?: boolean;
}

const RSVP_OPTIONS = [
  { value: 'going', label: 'Going', icon: UserCheck, color: 'text-primary', bgColor: 'bg-primary/10 border-primary/20' },
  { value: 'maybe', label: 'Maybe', icon: HelpCircle, color: 'text-muted-foreground', bgColor: 'bg-muted border-border' },
  { value: 'not_going', label: 'Not Going', icon: UserX, color: 'text-destructive', bgColor: 'bg-destructive/10 border-destructive/20' }
];

export const EnhancedRSVP: React.FC<EnhancedRSVPProps> = ({ 
  playerId, 
  eventId, 
  showAllEvents = false 
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedEventType, setSelectedEventType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch events
  const { data: events = [], isLoading: eventsLoading } = useQuery({
    queryKey: ['enhanced-rsvp-events', selectedEventType, searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('events')
        .select(`
          *,
          teams (
            name,
            age_group
          )
        `)
        .gte('event_date', new Date().toISOString())
        .order('event_date', { ascending: true });

      if (!showAllEvents && eventId) {
        query = query.eq('id', eventId);
      }

      if (selectedEventType !== 'all') {
        query = query.eq('event_type', selectedEventType);
      }

      if (searchTerm) {
        query = query.ilike('title', `%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Event[];
    }
  });

  // Fetch RSVP responses
  const { data: responses = [], isLoading: responsesLoading } = useQuery({
    queryKey: ['enhanced-rsvp-responses', playerId, events.map(e => e.id)],
    queryFn: async () => {
      if (!playerId || events.length === 0) return [];

      const { data, error } = await supabase
        .from('event_responses')
        .select(`
          *,
          players (
            id,
            first_name,
            last_name
          )
        `)
        .in('event_id', events.map(e => e.id))
        .eq('player_id', playerId);

      if (error) throw error;
      return data as EventResponse[];
    },
    enabled: !!playerId && events.length > 0
  });

  // Fetch all responses for event (for summary)
  const { data: eventSummaries = [] } = useQuery({
    queryKey: ['event-rsvp-summaries', events.map(e => e.id)],
    queryFn: async () => {
      if (events.length === 0) return [];

      const summaries = await Promise.all(
        events.map(async (event) => {
          const { data, error } = await supabase
            .from('event_responses')
            .select('rsvp_status')
            .eq('event_id', event.id);

          if (error) throw error;

          const going = data.filter(r => r.rsvp_status === 'going').length;
          const maybe = data.filter(r => r.rsvp_status === 'maybe').length;
          const notGoing = data.filter(r => r.rsvp_status === 'not_going').length;

          return {
            eventId: event.id,
            going,
            maybe,
            notGoing,
            total: data.length
          };
        })
      );

      return summaries;
    },
    enabled: events.length > 0
  });

  // Update RSVP mutation
  const updateRSVPMutation = useMutation({
    mutationFn: async ({ eventId, rsvpStatus }: { eventId: string; rsvpStatus: string }) => {
      if (!playerId) throw new Error('Player ID required');

      const { data: existingResponse } = await supabase
        .from('event_responses')
        .select('id')
        .eq('event_id', eventId)
        .eq('player_id', playerId)
        .single();

      if (existingResponse) {
        const { error } = await supabase
          .from('event_responses')
          .update({ 
            rsvp_status: rsvpStatus,
            response_date: new Date().toISOString()
          })
          .eq('id', existingResponse.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('event_responses')
          .insert({
            event_id: eventId,
            player_id: playerId,
            rsvp_status: rsvpStatus,
            response_date: new Date().toISOString()
          });
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enhanced-rsvp-responses'] });
      queryClient.invalidateQueries({ queryKey: ['event-rsvp-summaries'] });
      toast({
        title: "Success",
        description: "RSVP updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update RSVP",
        variant: "destructive",
      });
    }
  });

  const handleRSVPUpdate = useCallback((eventId: string, rsvpStatus: string) => {
    updateRSVPMutation.mutate({ eventId, rsvpStatus });
  }, [updateRSVPMutation]);

  const getPlayerResponse = (eventId: string) => {
    return responses.find(r => r.event_id === eventId);
  };

  const getEventSummary = (eventId: string) => {
    return eventSummaries.find(s => s.eventId === eventId);
  };

  if (eventsLoading || responsesLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarCheck className="h-5 w-5" />
            Enhanced RSVP System
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarCheck className="h-5 w-5" />
          Enhanced RSVP System
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {showAllEvents && (
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={selectedEventType} onValueChange={setSelectedEventType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="training">Training</SelectItem>
                <SelectItem value="match">Match</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {events.length === 0 ? (
          <div className="text-center py-8">
            <CalendarCheck className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No upcoming events found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map(event => {
              const playerResponse = getPlayerResponse(event.id);
              const summary = getEventSummary(event.id);
              
              return (
                <Card key={event.id} className="border-l-4 border-l-primary">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">{event.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(event.event_date).toLocaleDateString()} at{' '}
                            {new Date(event.event_date).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                          {event.location && (
                            <span>{event.location}</span>
                          )}
                          {event.teams && (
                            <Badge variant="outline">
                              {event.teams.name} ({event.teams.age_group})
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Badge variant="secondary" className="capitalize">
                        {event.event_type}
                      </Badge>
                    </div>

                    {playerId && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">Your Response:</span>
                          {playerResponse ? (
                            <Badge 
                              variant="outline"
                              className={RSVP_OPTIONS.find(opt => opt.value === playerResponse.rsvp_status)?.bgColor}
                            >
                              {RSVP_OPTIONS.find(opt => opt.value === playerResponse.rsvp_status)?.label}
                            </Badge>
                           ) : (
                             <Badge variant="outline" className="bg-muted">
                               Not Responded
                             </Badge>
                           )}
                        </div>

                        <div className="flex gap-2">
                          {RSVP_OPTIONS.map(option => {
                            const Icon = option.icon;
                            const isSelected = playerResponse?.rsvp_status === option.value;
                            
                            return (
                              <Button
                                key={option.value}
                                variant={isSelected ? "default" : "outline"}
                                size="sm"
                                onClick={() => handleRSVPUpdate(event.id, option.value)}
                                disabled={updateRSVPMutation.isPending}
                                className={`flex items-center gap-1 ${!isSelected ? option.color : ''}`}
                              >
                                <Icon className="h-4 w-4" />
                                {option.label}
                              </Button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {summary && (
                      <div className="mt-4 pt-3 border-t">
                        <div className="flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1 text-green-600">
                            <UserCheck className="h-4 w-4" />
                            {summary.going} Going
                          </span>
                          <span className="flex items-center gap-1 text-yellow-600">
                            <HelpCircle className="h-4 w-4" />
                            {summary.maybe} Maybe
                          </span>
                          <span className="flex items-center gap-1 text-red-600">
                            <UserX className="h-4 w-4" />
                            {summary.notGoing} Not Going
                          </span>
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Users className="h-4 w-4" />
                            {summary.total} Total Responses
                          </span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};