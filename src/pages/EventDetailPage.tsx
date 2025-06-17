import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, Calendar, MapPin, Users, Clock, UserCheck, UserX, HelpCircle, BarChart3 } from 'lucide-react';
import { api } from '@/services/unifiedApi';
import { Event, Team, Child, Attendance } from '@/types';
import { toast } from "sonner";
import { useAuth } from '@/context/AuthContext';
import { MatchStatsForm } from '@/components/MatchStatsForm';
import { logger } from '@/utils/logger';

const EventDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  
  const [event, setEvent] = useState<Event | null>(null);
  const [team, setTeam] = useState<Team | null>(null);
  const [teamPlayers, setTeamPlayers] = useState<Child[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [showStatsForm, setShowStatsForm] = useState(false);

  useEffect(() => {
    if (id) {
      loadEventData();
    }
  }, [id]);

  const loadEventData = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const eventData = await api.getEventById(id);
      setEvent(eventData || null); // Handle undefined case

      if (eventData) {
        const [teamData, attendanceData] = await Promise.all([
          api.getTeamById(eventData.teamId),
          api.getAttendanceByEventId(id)
        ]);

        if (teamData) {
          setTeam(teamData);
          // Get team players using unified API
          const players = await api.getChildrenByTeamId(teamData.id);
          setTeamPlayers(players);
        }

        setAttendance(attendanceData);
      }
    } catch (error) {
      logger.error('Error loading event data:', error);
      toast.error('Failed to load event data');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/events');
  };

  const formatDate = (dateStr: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateStr).toLocaleDateString('en-GB', options);
  };

  const formatTime = (timeStr: string) => {
    return timeStr.substring(0, 5);
  };

  const getAttendanceStats = () => {
    const going = attendance.filter(a => a.rsvp === 'going').length;
    const notGoing = attendance.filter(a => a.rsvp === 'not_going').length;
    const maybe = attendance.filter(a => a.rsvp === 'maybe').length;
    const noResponse = Math.max(0, teamPlayers.length - attendance.length);
    
    return { going, notGoing, maybe, noResponse };
  };

  const getAttendanceIcon = (rsvp: string) => {
    switch (rsvp) {
      case 'going':
        return <UserCheck className="h-4 w-4 text-green-600" />;
      case 'not_going':
        return <UserX className="h-4 w-4 text-red-600" />;
      case 'maybe':
        return <HelpCircle className="h-4 w-4 text-yellow-600" />;
      default:
        return <HelpCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getEventTypeDisplay = () => {
    switch (event?.eventType) {
      case 'match':
        return { name: 'Match', color: 'bg-primary text-primary-foreground' };
      case 'training':
        return { name: 'Training', color: 'bg-secondary text-secondary-foreground' };
      default:
        return { name: 'Other', color: 'bg-muted text-muted-foreground' };
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse text-center">
            <div className="h-8 w-48 bg-muted rounded mb-4 mx-auto"></div>
            <div className="h-4 w-32 bg-muted rounded mx-auto"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!event) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-4">Event not found</h2>
          <Button onClick={handleBack}>Return to Events</Button>
        </div>
      </Layout>
    );
  }

  const eventTypeDisplay = getEventTypeDisplay();
  const attendanceStats = getAttendanceStats();

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Button 
            variant="outline" 
            onClick={handleBack}
            className="self-start"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Events
          </Button>
          
          {(hasRole('admin') || hasRole('coach') || hasRole('manager')) && (
            <div className="flex gap-2">
              {event.eventType === 'match' && (
                <Dialog open={showStatsForm} onOpenChange={setShowStatsForm}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Match Stats
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Enter Match Statistics</DialogTitle>
                    </DialogHeader>
                    <MatchStatsForm
                      eventId={event.id}
                      players={teamPlayers}
                      onClose={() => setShowStatsForm(false)}
                      onSave={() => {
                        toast.success('Match statistics saved successfully');
                        loadEventData();
                      }}
                    />
                  </DialogContent>
                </Dialog>
              )}
              <Button 
                variant="outline" 
                size="sm"
                asChild
              >
                <Link to={`/events/${event.id}/edit`}>
                  Edit Event
                </Link>
              </Button>
            </div>
          )}
        </div>

        {/* Event Header */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <Badge className={eventTypeDisplay.color}>
                  {eventTypeDisplay.name}
                </Badge>
                <CardTitle className="text-2xl mt-2">{event.name}</CardTitle>
                {team && (
                  <div className="text-muted-foreground mt-1">
                    {team.name}
                  </div>
                )}
              </div>
              
              <div className="mt-2 sm:mt-0">
                {event.eventType === 'match' && event.opponent && (
                  <div className="bg-muted px-4 py-2 rounded-md text-center">
                    <div className="text-xs text-muted-foreground">Opponent</div>
                    <div className="font-medium">{event.opponent}</div>
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Event Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">Date</div>
                  <div className="text-sm text-muted-foreground">{formatDate(event.date)}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">Time</div>
                  <div className="text-sm text-muted-foreground">{formatTime(event.time)}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 md:col-span-2">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">Location</div>
                  <div className="text-sm text-muted-foreground">{event.location}</div>
                </div>
              </div>
            </div>

            {event.notes && (
              <div className="bg-muted p-4 rounded-lg">
                <div className="font-medium mb-2">Notes</div>
                <div className="text-sm">{event.notes}</div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Attendance Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Attendance Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                <UserCheck className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-700">{attendanceStats.going}</div>
                <div className="text-sm text-green-600">Going</div>
              </div>
              
              <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                <UserX className="h-8 w-8 text-red-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-red-700">{attendanceStats.notGoing}</div>
                <div className="text-sm text-red-600">Not Going</div>
              </div>
              
              <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <HelpCircle className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-yellow-700">{attendanceStats.maybe}</div>
                <div className="text-sm text-yellow-600">Maybe</div>
              </div>
              
              <div className="text-center p-4 bg-muted rounded-lg">
                <HelpCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <div className="text-2xl font-bold text-muted-foreground">{attendanceStats.noResponse}</div>
                <div className="text-sm text-muted-foreground">No Response</div>
              </div>
            </div>

            {teamPlayers.length > 0 && (
              <div className="mt-6">
                <h4 className="font-medium mb-4">Team Members</h4>
                <div className="space-y-2">
                  {teamPlayers.map(player => {
                    const playerAttendance = attendance.find(a => a.childId === player.id);
                    return (
                      <div key={player.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={player.profileImage} />
                            <AvatarFallback>
                              {player.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{player.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {getAttendanceIcon(playerAttendance?.rsvp || 'no_response')}
                          <span className="text-sm text-muted-foreground capitalize">
                            {playerAttendance?.rsvp?.replace('_', ' ') || 'No response'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default EventDetailPage;