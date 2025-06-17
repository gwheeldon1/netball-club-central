import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, Users } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface Event {
  id: string;
  title: string;
  description?: string;
  event_date: string;
  location?: string;
  event_type: string;
  team_id?: string;
  is_home?: boolean;
  teams?: { name: string; age_group: string };
}

interface CalendarEventCardProps {
  event: Event;
  onSelect?: (event: Event) => void;
}

export const CalendarEventCard: React.FC<CalendarEventCardProps> = ({ event, onSelect }) => {
  const handleClick = () => {
    onSelect?.(event);
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'match':
        return 'destructive';
      case 'training':
        return 'default';
      case 'other':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handleClick}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-sm line-clamp-1">{event.title}</h3>
          <Badge variant={getEventTypeColor(event.event_type)} className="text-xs">
            {event.event_type}
          </Badge>
        </div>
        
        <div className="space-y-1 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>
              {format(parseISO(event.event_date), 'HH:mm')}
            </span>
          </div>
          
          {event.location && (
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span className="line-clamp-1">{event.location}</span>
            </div>
          )}
          
          {event.teams && (
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span className="line-clamp-1">
                {event.teams.name} ({event.teams.age_group})
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};