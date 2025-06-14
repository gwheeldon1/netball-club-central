import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Team {
  id: string;
  name: string;
  age_group: string;
}

interface CalendarFiltersProps {
  teams: Team[];
  selectedTeam: string;
  selectedEventType: string;
  onTeamChange: (team: string) => void;
  onEventTypeChange: (type: string) => void;
}

export const CalendarFilters: React.FC<CalendarFiltersProps> = ({
  teams,
  selectedTeam,
  selectedEventType,
  onTeamChange,
  onEventTypeChange
}) => {
  return (
    <div className="flex items-center gap-4">
      <Select value={selectedTeam} onValueChange={onTeamChange}>
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

      <Select value={selectedEventType} onValueChange={onEventTypeChange}>
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
  );
};