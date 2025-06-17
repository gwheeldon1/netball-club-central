import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, UserCheck, UserX, HelpCircle, Users } from 'lucide-react';

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

interface RSVPEventCardProps {
  event: Event;
  playerResponse?: EventResponse;
  summary?: {
    going: number;
    maybe: number;
    notGoing: number;
    total: number;
  };
  playerId?: string;
  onRSVPUpdate: (eventId: string, rsvpStatus: string) => void;
  isUpdating: boolean;
}

const RSVP_OPTIONS = [
  { value: 'going', label: 'Going', icon: UserCheck, color: 'text-primary', bgColor: 'bg-primary/10 border-primary/20' },
  { value: 'maybe', label: 'Maybe', icon: HelpCircle, color: 'text-muted-foreground', bgColor: 'bg-muted border-border' },
  { value: 'not_going', label: 'Not Going', icon: UserX, color: 'text-destructive', bgColor: 'bg-destructive/10 border-destructive/20' }
];

export const RSVPEventCard: React.FC<RSVPEventCardProps> = ({
  event,
  playerResponse,
  summary,
  playerId,
  onRSVPUpdate,
  isUpdating
}) => {
  return (
    <Card className="border-l-4 border-l-primary">
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
              {event.location && <span>{event.location}</span>}
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
                    onClick={() => onRSVPUpdate(event.id, option.value)}
                    disabled={isUpdating}
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
};