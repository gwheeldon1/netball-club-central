import React, { useState, useCallback, useMemo } from 'react';
import { Calendar, momentLocalizer, View } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, parseISO } from 'date-fns';
import { CalendarToolbarProps } from '@/types/component-props';

const localizer = momentLocalizer(moment);

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

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: Event;
}

interface CalendarViewProps {
  teamFilter?: string;
  eventTypeFilter?: string;
  onEventSelect?: (event: Event) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({
  teamFilter,
  eventTypeFilter,
  onEventSelect
}) => {
  const [currentView, setCurrentView] = useState<View>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedTeam, setSelectedTeam] = useState<string>(teamFilter || 'all');
  const [selectedEventType, setSelectedEventType] = useState<string>(eventTypeFilter || 'all');

  // Fetch events
  const { data: events = [], isLoading } = useQuery({
    queryKey: ['calendar-events', selectedTeam, selectedEventType],
    queryFn: async () => {
      let query = supabase
        .from('events')
        .select(`
          *,
          teams!left (
            name,
            age_group
          )
        `)
        .order('event_date', { ascending: true });

      if (selectedTeam !== 'all') {
        query = query.eq('team_id', selectedTeam);
      }

      if (selectedEventType !== 'all') {
        query = query.eq('event_type', selectedEventType);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []).map(item => ({
        ...item,
        teams: item.teams || { name: '', age_group: '' }
      })) as Event[];
    }
  });

  // Fetch teams for filter
  const { data: teams = [] } = useQuery({
    queryKey: ['teams-calendar'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teams')
        .select('id, name, age_group')
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  // Convert events to calendar format
  const calendarEvents: CalendarEvent[] = useMemo(() => {
    return events.map(event => {
      const startDate = parseISO(event.event_date);
      const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // 2 hours default

      return {
        id: event.id,
        title: event.title,
        start: startDate,
        end: endDate,
        resource: event
      };
    });
  }, [events]);

  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    onEventSelect?.(event.resource);
  }, [onEventSelect]);

  const handleNavigate = useCallback((newDate: Date) => {
    setCurrentDate(newDate);
  }, []);

  const handleViewChange = useCallback((view: View) => {
    setCurrentView(view);
  }, []);

  // Custom event style function
  const eventStyleGetter = useCallback((event: CalendarEvent) => {
    const eventType = event.resource.event_type;
    let backgroundColor = 'hsl(var(--primary))';
    
    switch (eventType) {
      case 'match':
        backgroundColor = 'hsl(var(--destructive))';
        break;
      case 'training':
        backgroundColor = 'hsl(var(--primary))';
        break;
      case 'other':
        backgroundColor = 'hsl(var(--secondary))';
        break;
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    };
  }, []);

  // Custom toolbar
  const CustomToolbar = ({ label, onNavigate, onView }: CalendarToolbarProps) => (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={() => onNavigate('PREV')}>
          Previous
        </Button>
        <Button variant="outline" onClick={() => onNavigate('TODAY')}>
          Today
        </Button>
        <Button variant="outline" onClick={() => onNavigate('NEXT')}>
          Next
        </Button>
      </div>
      
      <h2 className="text-xl font-semibold">{label}</h2>
      
      <div className="flex items-center gap-2">
        <Button
          variant={currentView === 'month' ? 'default' : 'outline'}
          onClick={() => onView('month')}
        >
          Month
        </Button>
        <Button
          variant={currentView === 'week' ? 'default' : 'outline'}
          onClick={() => onView('week')}
        >
          Week
        </Button>
        <Button
          variant={currentView === 'day' ? 'default' : 'outline'}
          onClick={() => onView('day')}
        >
          Day
        </Button>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="h-96 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Calendar View</CardTitle>
          <div className="flex items-center gap-4">
            <Select value={selectedTeam} onValueChange={setSelectedTeam}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by team" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Teams</SelectItem>
                {teams.map(team => (
                  <SelectItem key={team.id} value={team.id}>
                    {team.name} ({team.age_group})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedEventType} onValueChange={setSelectedEventType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="training">Training</SelectItem>
                <SelectItem value="match">Matches</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="h-[600px]">
          <Calendar
            localizer={localizer}
            events={calendarEvents}
            startAccessor="start"
            endAccessor="end"
            onSelectEvent={handleSelectEvent}
            onNavigate={handleNavigate}
            onView={handleViewChange}
            view={currentView}
            date={currentDate}
            eventPropGetter={eventStyleGetter}
            components={{
              toolbar: CustomToolbar
            }}
            popup
            popupOffset={30}
          />
        </div>
        
        <div className="mt-4 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-primary"></div>
            <span className="text-sm">Training</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-destructive"></div>
            <span className="text-sm">Match</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-secondary"></div>
            <span className="text-sm">Other</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CalendarView;