import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, XCircle, AlertTriangle, Clock, User } from 'lucide-react';

interface Player {
  id: string;
  first_name: string;
  last_name: string;
  profile_image?: string;
}

interface EventResponse {
  id: string;
  player_id: string;
  rsvp_status: string;
  attendance_status: string;
  notes?: string;
  players: Player;
}

interface AttendanceMarkingProps {
  eventId: string;
  eventTitle: string;
}

const ATTENDANCE_OPTIONS = [
  { value: 'present', label: 'Present', icon: CheckCircle, color: 'text-green-600' },
  { value: 'absent', label: 'Absent', icon: XCircle, color: 'text-red-600' },
  { value: 'injured', label: 'Injured', icon: AlertTriangle, color: 'text-yellow-600' },
  { value: 'late', label: 'Late', icon: Clock, color: 'text-orange-600' },
  { value: 'not_marked', label: 'Not Marked', icon: User, color: 'text-gray-400' }
];

const AttendanceMarking: React.FC<AttendanceMarkingProps> = ({ eventId, eventTitle }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [attendanceNotes, setAttendanceNotes] = useState<Record<string, string>>({});

  // Fetch event responses (RSVPs and attendance)
  const { data: responses = [], isLoading } = useQuery({
    queryKey: ['event-responses', eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('event_responses')
        .select(`
          *,
          players (
            id,
            first_name,
            last_name,
            profile_image
          )
        `)
        .eq('event_id', eventId);

      if (error) throw error;
      return data as EventResponse[];
    }
  });

  // Update attendance mutation
  const updateAttendanceMutation = useMutation({
    mutationFn: async ({ responseId, attendanceStatus, notes }: {
      responseId: string;
      attendanceStatus: string;
      notes?: string;
    }) => {
      const { error } = await supabase
        .from('event_responses')
        .update({
          attendance_status: attendanceStatus,
          notes: notes,
          attendance_marked_at: new Date().toISOString()
        })
        .eq('id', responseId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-responses', eventId] });
      toast({
        title: 'Success',
        description: 'Attendance updated successfully',
      });
    },
    onError: (error) => {
      console.error('Error updating attendance:', error);
      toast({
        title: 'Error',
        description: 'Failed to update attendance',
        variant: 'destructive',
      });
    }
  });

  const handleAttendanceChange = (responseId: string, attendanceStatus: string) => {
    const notes = attendanceNotes[responseId] || '';
    updateAttendanceMutation.mutate({ responseId, attendanceStatus, notes });
  };

  const handleNotesChange = (responseId: string, notes: string) => {
    setAttendanceNotes(prev => ({ ...prev, [responseId]: notes }));
  };

  const saveNotes = (responseId: string, currentStatus: string) => {
    const notes = attendanceNotes[responseId] || '';
    updateAttendanceMutation.mutate({ responseId, attendanceStatus: currentStatus, notes });
  };

  const getAttendanceOption = (status: string) => {
    return ATTENDANCE_OPTIONS.find(option => option.value === status) || ATTENDANCE_OPTIONS[4];
  };

  const getAttendanceSummary = () => {
    const summary = responses.reduce((acc, response) => {
      const status = response.attendance_status || 'not_marked';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return summary;
  };

  const summary = getAttendanceSummary();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-muted rounded w-1/3"></div>
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-muted rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-1/4"></div>
                    <div className="h-4 bg-muted rounded w-1/3"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Attendance for {eventTitle}</span>
          <div className="flex gap-2">
            {ATTENDANCE_OPTIONS.slice(0, 4).map(option => {
              const count = summary[option.value] || 0;
              const Icon = option.icon;
              return (
                <Badge key={option.value} variant="outline" className="flex items-center gap-1">
                  <Icon className={`w-3 h-3 ${option.color}`} />
                  {count}
                </Badge>
              );
            })}
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {responses.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No RSVPs found for this event
          </div>
        ) : (
          <div className="space-y-4">
            {responses.map(response => {
              const attendanceOption = getAttendanceOption(response.attendance_status || 'not_marked');
              const Icon = attendanceOption.icon;
              
              return (
                <div key={response.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                  <Avatar>
                    <AvatarImage src={response.players.profile_image} />
                    <AvatarFallback>
                      {response.players.first_name[0]}{response.players.last_name[0]}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">
                          {response.players.first_name} {response.players.last_name}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          RSVP: <Badge variant="outline">{response.rsvp_status}</Badge>
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 ${attendanceOption.color}`} />
                        <Select
                          value={response.attendance_status || 'not_marked'}
                          onValueChange={(value) => handleAttendanceChange(response.id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ATTENDANCE_OPTIONS.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                <div className="flex items-center gap-2">
                                  <option.icon className={`w-3 h-3 ${option.color}`} />
                                  {option.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`notes-${response.id}`} className="text-sm">
                        Notes (optional)
                      </Label>
                      <div className="flex gap-2">
                        <Textarea
                          id={`notes-${response.id}`}
                          placeholder="Add attendance notes..."
                          value={attendanceNotes[response.id] || response.notes || ''}
                          onChange={(e) => handleNotesChange(response.id, e.target.value)}
                          className="flex-1"
                          rows={2}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => saveNotes(response.id, response.attendance_status || 'not_marked')}
                          disabled={updateAttendanceMutation.isPending}
                        >
                          Save Notes
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AttendanceMarking;