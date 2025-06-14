import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface RSVPFiltersProps {
  searchTerm: string;
  selectedEventType: string;
  onSearchChange: (value: string) => void;
  onEventTypeChange: (value: string) => void;
}

export const RSVPFilters: React.FC<RSVPFiltersProps> = ({
  searchTerm,
  selectedEventType,
  onSearchChange,
  onEventTypeChange
}) => {
  return (
    <div className="flex gap-4 mb-6">
      <div className="flex-1">
        <Input
          placeholder="Search events..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <Select value={selectedEventType} onValueChange={onEventTypeChange}>
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
  );
};