import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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

interface AttendancePlayerCardProps {
  response: EventResponse;
  attendanceNotes: Record<string, string>;
  onAttendanceChange: (responseId: string, status: string) => void;
  onNotesChange: (responseId: string, notes: string) => void;
  onSaveNotes: (responseId: string, status: string) => void;
  isUpdating: boolean;
}

const ATTENDANCE_OPTIONS = [
  { value: 'present', label: 'Present', icon: CheckCircle, color: 'text-green-600' },
  { value: 'absent', label: 'Absent', icon: XCircle, color: 'text-red-600' },
  { value: 'injured', label: 'Injured', icon: AlertTriangle, color: 'text-yellow-600' },
  { value: 'late', label: 'Late', icon: Clock, color: 'text-orange-600' },
  { value: 'not_marked', label: 'Not Marked', icon: User, color: 'text-gray-400' }
];

export const AttendancePlayerCard: React.FC<AttendancePlayerCardProps> = ({
  response,
  attendanceNotes,
  onAttendanceChange,
  onNotesChange,
  onSaveNotes,
  isUpdating
}) => {
  const getAttendanceOption = (status: string) => {
    return ATTENDANCE_OPTIONS.find(option => option.value === status) || ATTENDANCE_OPTIONS[4];
  };

  const attendanceOption = getAttendanceOption(response.attendance_status || 'not_marked');
  const Icon = attendanceOption.icon;

  return (
    <div className="flex items-start space-x-4 p-4 border rounded-lg">
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
              onValueChange={(value) => onAttendanceChange(response.id, value)}
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
              onChange={(e) => onNotesChange(response.id, e.target.value)}
              className="flex-1"
              rows={2}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSaveNotes(response.id, response.attendance_status || 'not_marked')}
              disabled={isUpdating}
            >
              Save Notes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};