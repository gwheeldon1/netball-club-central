
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import { useOffline } from "@/hooks/use-offline";
import { useAuth } from "@/context/AuthContext";
import { Event, Team, Child, Attendance } from "@/types";
import { eventApi, teamApi, childrenApi, attendanceApi } from "@/services/api";
import { Calendar, MapPin, Clock, AlertTriangle, ArrowLeft, Users } from "lucide-react";
import { toast } from "sonner";

const EventDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasRole, isOffline } = useAuth();
  const isMobile = useIsMobile();
  const [event, setEvent] = useState<Event | null>(null);
  const [team, setTeam] = useState<Team | null>(null);
  const [teamMembers, setTeamMembers] = useState<Child[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load event data
  useEffect(() => {
    const loadData = async () => {
      if (!id) {
        setError("Event ID not provided");
        setLoading(false);
        return;
      }

      try {
        const eventData = eventApi.getById(id);
        
        if (!eventData) {
          setError("Event not found");
          setLoading(false);
          return;
        }

        setEvent(eventData);
        
        // Load related data
        if (eventData.teamId) {
          const teamData = teamApi.getById(eventData.teamId);
          setTeam(teamData || null);
          
          const members = childrenApi.getByTeamId(eventData.teamId);
          setTeamMembers(members);
          
          const attendanceData = attendanceApi.getByEventId(id);
          setAttendance(attendanceData);
        }
        
      } catch (error) {
        console.error("Error loading event data:", error);
        setError("Failed to load event data");
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [id]);

  // Format date for display
  const formatDate = (dateStr: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateStr).toLocaleDateString('en-GB', options);
  };

  // Format time for display
  const formatTime = (timeStr: string) => {
    return timeStr.substring(0, 5);
  };

  // Handle back button
  const handleBack = () => {
    navigate("/events");
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-12 w-12 bg-muted rounded-full mb-4"></div>
            <div className="h-4 w-32 bg-muted rounded mb-2"></div>
            <div className="h-3 w-24 bg-muted/50 rounded"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !event) {
    return (
      <Layout>
        <div className="space-y-4">
          <Button 
            variant="outline" 
            onClick={handleBack}
            className="mb-4"
            size="sm"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Events
          </Button>
          
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
              <h2 className="text-xl font-semibold mb-2">Event Not Found</h2>
              <p className="text-muted-foreground mb-6">{error || "The requested event could not be found"}</p>
              <Button onClick={handleBack}>Return to Events List</Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  // Get attendance status counts
  const getAttendanceCounts = () => {
    const going = attendance.filter(a => a.rsvp === 'going').length;
    const notGoing = attendance.filter(a => a.rsvp === 'not_going').length;
    const notResponded = teamMembers.length - going - notGoing;
    
    return { going, notGoing, notResponded };
  };

  const attendanceCounts = getAttendanceCounts();
  
  // Get event type display name and color
  const getEventTypeDisplay = () => {
    switch (event.eventType) {
      case 'match':
        return { name: 'Match', color: 'bg-primary/10 text-primary' };
      case 'training':
        return { name: 'Training', color: 'bg-secondary text-secondary-foreground' };
      default:
        return { name: 'Other', color: 'bg-muted text-muted-foreground' };
    }
  };
  
  const eventTypeDisplay = getEventTypeDisplay();

  return (
    <Layout>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <Button 
            variant="outline" 
            onClick={handleBack}
            className="self-start"
            size={isMobile ? "sm" : "default"}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Events
          </Button>
          
          {(hasRole("admin") || hasRole("coach") || hasRole("manager")) && (
            <Button 
              variant="outline"
              className="self-start sm:self-auto"
              size={isMobile ? "sm" : "default"}
              asChild
            >
              <Link to={`/events/${id}/edit`}>
                Edit Event
              </Link>
            </Button>
          )}
        </div>
        
        {isOffline && (
          <Alert className="bg-background border-border">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <AlertDescription className="text-muted-foreground text-sm">
              You are offline. Some features may be limited.
            </AlertDescription>
          </Alert>
        )}
        
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <Badge className={`mb-2 ${eventTypeDisplay.color}`}>
                  {eventTypeDisplay.name}
                </Badge>
                <CardTitle className="text-xl sm:text-2xl">{event.name}</CardTitle>
                {team && (
                  <div className="text-sm text-muted-foreground mt-1">
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
          
          <CardContent className="space-y-4 sm:space-y-6">
            {/* Event Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <div className="font-medium">Date</div>
                  <div className="text-sm text-muted-foreground">{formatDate(event.date)}</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <div className="font-medium">Time</div>
                  <div className="text-sm text-muted-foreground">{formatTime(event.time)}</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3 sm:col-span-2">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <div className="font-medium">Location</div>
                  <div className="text-sm text-muted-foreground">{event.location}</div>
                </div>
              </div>
              
              {event.notes && (
                <div className="sm:col-span-2 bg-muted p-3 rounded-md">
                  <div className="font-medium mb-1">Notes</div>
                  <div className="text-sm text-muted-foreground">{event.notes}</div>
                </div>
              )}
            </div>
            
            <Separator />
            
            {/* Attendance Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Attendance
                </h3>
                
                {(hasRole("admin") || hasRole("coach") || hasRole("manager")) && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    asChild
                  >
                    <Link to={`/events/${id}/attendance`}>
                      Manage Attendance
                    </Link>
                  </Button>
                )}
              </div>
              
              <div className="grid grid-cols-3 gap-2 sm:gap-4">
                <div className="bg-primary/10 text-primary rounded p-3 text-center">
                  <div className="text-2xl font-bold">{attendanceCounts.going}</div>
                  <div className="text-xs sm:text-sm">Going</div>
                </div>
                
                <div className="bg-destructive/10 text-destructive rounded p-3 text-center">
                  <div className="text-2xl font-bold">{attendanceCounts.notGoing}</div>
                  <div className="text-xs sm:text-sm">Not Going</div>
                </div>
                
                <div className="bg-muted rounded p-3 text-center">
                  <div className="text-2xl font-bold text-muted-foreground">{attendanceCounts.notResponded}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">No Response</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default EventDetailPage;
