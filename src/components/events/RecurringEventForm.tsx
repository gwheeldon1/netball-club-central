import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, RotateCcw, Clock } from 'lucide-react';
import { format, addWeeks, addMonths, addDays } from 'date-fns';

interface RecurrencePattern {
  type: 'weekly' | 'biweekly' | 'monthly';
  interval: number;
  daysOfWeek: number[];
  endDate?: Date;
  maxOccurrences?: number;
}

interface RecurringEventFormProps {
  onRecurrenceChange: (pattern: RecurrencePattern | null) => void;
  initialPattern?: RecurrencePattern;
  eventDate: Date;
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday', short: 'Sun' },
  { value: 1, label: 'Monday', short: 'Mon' },
  { value: 2, label: 'Tuesday', short: 'Tue' },
  { value: 3, label: 'Wednesday', short: 'Wed' },
  { value: 4, label: 'Thursday', short: 'Thu' },
  { value: 5, label: 'Friday', short: 'Fri' },
  { value: 6, label: 'Saturday', short: 'Sat' },
];

export const RecurringEventForm: React.FC<RecurringEventFormProps> = ({
  onRecurrenceChange,
  initialPattern,
  eventDate
}) => {
  const [isRecurring, setIsRecurring] = useState(!!initialPattern);
  const [pattern, setPattern] = useState<RecurrencePattern>(
    initialPattern || {
      type: 'weekly',
      interval: 1,
      daysOfWeek: [eventDate.getDay()],
      maxOccurrences: 10
    }
  );
  const [endDateOpen, setEndDateOpen] = useState(false);

  const updatePattern = (updates: Partial<RecurrencePattern>) => {
    const newPattern = { ...pattern, ...updates };
    setPattern(newPattern);
    onRecurrenceChange(isRecurring ? newPattern : null);
  };

  const toggleRecurring = (enabled: boolean) => {
    setIsRecurring(enabled);
    onRecurrenceChange(enabled ? pattern : null);
  };

  const toggleDayOfWeek = (dayValue: number) => {
    const newDays = pattern.daysOfWeek.includes(dayValue)
      ? pattern.daysOfWeek.filter(d => d !== dayValue)
      : [...pattern.daysOfWeek, dayValue].sort();
    
    if (newDays.length > 0) {
      updatePattern({ daysOfWeek: newDays });
    }
  };

  const getPreviewDates = () => {
    if (!isRecurring) return [];
    
    const dates: Date[] = [];
    let currentDate = new Date(eventDate);
    const maxPreview = 5;
    
    for (let i = 0; i < maxPreview && dates.length < maxPreview; i++) {
      if (pattern.daysOfWeek.includes(currentDate.getDay())) {
        dates.push(new Date(currentDate));
      }
      
      // Move to next occurrence based on pattern
      switch (pattern.type) {
        case 'weekly':
          currentDate = addDays(currentDate, 1);
          if (currentDate.getDay() === 0) { // Start of new week
            currentDate = addWeeks(currentDate, pattern.interval - 1);
          }
          break;
        case 'biweekly':
          currentDate = addDays(currentDate, 1);
          if (currentDate.getDay() === 0) { // Start of new week
            currentDate = addWeeks(currentDate, (pattern.interval * 2) - 1);
          }
          break;
        case 'monthly':
          currentDate = addMonths(currentDate, pattern.interval);
          break;
      }
      
      // Check end conditions
      if (pattern.endDate && currentDate > pattern.endDate) break;
      if (pattern.maxOccurrences && dates.length >= pattern.maxOccurrences) break;
    }
    
    return dates;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RotateCcw className="h-5 w-5" />
          Recurring Event Options
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="recurring"
            checked={isRecurring}
            onCheckedChange={toggleRecurring}
          />
          <Label htmlFor="recurring">Make this a recurring event</Label>
        </div>

        {isRecurring && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="recurrence-type">Repeat</Label>
                <Select
                  value={pattern.type}
                  onValueChange={(value: 'weekly' | 'biweekly' | 'monthly') =>
                    updatePattern({ type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="biweekly">Every 2 weeks</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="interval">Every</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="interval"
                    type="number"
                    min="1"
                    max="12"
                    value={pattern.interval}
                    onChange={(e) =>
                      updatePattern({ interval: parseInt(e.target.value) || 1 })
                    }
                    className="w-20"
                  />
                  <span className="text-sm text-muted-foreground">
                    {pattern.type === 'weekly' ? 'week(s)' : 
                     pattern.type === 'biweekly' ? 'fortnight(s)' : 'month(s)'}
                  </span>
                </div>
              </div>
            </div>

            {(pattern.type === 'weekly' || pattern.type === 'biweekly') && (
              <div>
                <Label>Repeat on</Label>
                <div className="grid grid-cols-7 gap-2 mt-2">
                  {DAYS_OF_WEEK.map((day) => (
                    <Button
                      key={day.value}
                      variant={pattern.daysOfWeek.includes(day.value) ? "default" : "outline"}
                      size="sm"
                      className="h-8"
                      onClick={() => toggleDayOfWeek(day.value)}
                    >
                      {day.short}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>End after</Label>
                <div className="flex items-center gap-2 mt-2">
                  <Input
                    type="number"
                    min="1"
                    max="100"
                    value={pattern.maxOccurrences || ''}
                    onChange={(e) =>
                      updatePattern({ 
                        maxOccurrences: parseInt(e.target.value) || undefined,
                        endDate: undefined 
                      })
                    }
                    className="w-20"
                  />
                  <span className="text-sm text-muted-foreground">occurrences</span>
                </div>
              </div>

              <div>
                <Label>Or end on date</Label>
                <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal mt-2"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {pattern.endDate ? format(pattern.endDate, 'PPP') : 'Select date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={pattern.endDate}
                      onSelect={(date) => {
                        updatePattern({ 
                          endDate: date, 
                          maxOccurrences: undefined 
                        });
                        setEndDateOpen(false);
                      }}
                      disabled={(date) => date <= eventDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div>
              <Label className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Preview (first 5 occurrences)
              </Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {getPreviewDates().map((date, index) => (
                  <Badge key={index} variant="outline">
                    {format(date, 'MMM d, yyyy')}
                  </Badge>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};