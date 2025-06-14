import React from 'react';
import { Button } from '@/components/ui/button';
import { View } from 'react-big-calendar';

interface CalendarToolbarProps {
  label: string;
  onNavigate: (action: 'PREV' | 'NEXT' | 'TODAY') => void;
  onView: (view: View) => void;
  currentView: View;
}

export const CalendarToolbar: React.FC<CalendarToolbarProps> = ({
  label,
  onNavigate,
  onView,
  currentView
}) => {
  return (
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
};