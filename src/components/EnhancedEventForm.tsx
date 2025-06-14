import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { format, addDays } from 'date-fns';
import { createRecurringEvents, RecurringEventData } from '@/services/eventRecurrenceApi';
import { logger } from '@/utils/logger';

const eventSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  event_date: z.string().min(1, 'Event date is required'),
  location: z.string().optional(),
  event_type: z.enum(['training', 'match', 'other']),
  team_id: z.string().min(1, 'Team is required'),
  is_home: z.boolean().optional(),
  is_recurring: z.boolean().default(false),
  recurrence_type: z.enum(['daily', 'weekly', 'monthly']).optional(),
  recurrence_interval: z.number().min(1).optional(),
  recurrence_days: z.array(z.string()).optional(),
  recurrence_end_date: z.string().optional()
});

type EventFormData = z.infer<typeof eventSchema>;

interface EnhancedEventFormProps {
  teams: Array<{ id: string; name: string; age_group: string }>;
  onSuccess: () => void;
  onCancel: () => void;
  initialData?: Partial<EventFormData>;
}

const DAYS_OF_WEEK = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' }
];

const EnhancedEventForm: React.FC<EnhancedEventFormProps> = ({
  teams,
  onSuccess,
  onCancel,
  initialData
}) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      event_date: initialData?.event_date || format(new Date(), 'yyyy-MM-dd\'T\'HH:mm'),
      location: initialData?.location || '',
      event_type: initialData?.event_type || 'training',
      team_id: initialData?.team_id || '',
      is_home: initialData?.is_home || false,
      is_recurring: false,
      recurrence_type: 'weekly',
      recurrence_interval: 1,
      recurrence_end_date: format(addDays(new Date(), 30), 'yyyy-MM-dd')
    }
  });

  const isRecurring = form.watch('is_recurring');
  const recurrenceType = form.watch('recurrence_type');

  const handleDayToggle = (day: string) => {
    const newDays = selectedDays.includes(day)
      ? selectedDays.filter(d => d !== day)
      : [...selectedDays, day];
    setSelectedDays(newDays);
    form.setValue('recurrence_days', newDays);
  };

  const onSubmit = async (data: EventFormData) => {
    try {
      setIsSubmitting(true);

      if (data.is_recurring) {
        // Create recurring events
        const recurringData: RecurringEventData = {
          title: data.title,
          description: data.description,
          event_date: data.event_date,
          location: data.location,
          event_type: data.event_type,
          team_id: data.team_id,
          is_home: data.is_home,
          recurrence_type: data.recurrence_type!,
          recurrence_interval: data.recurrence_interval!,
          recurrence_days: data.recurrence_days,
          recurrence_end_date: data.recurrence_end_date!
        };

        const result = await createRecurringEvents(recurringData);
        
        toast({
          title: 'Success',
          description: `Created recurring event series with ${result.recurringCount + 1} events`,
        });
      } else {
        // Create single event using existing API
        const { supabase } = await import('@/integrations/supabase/client');
        
        const { error } = await supabase
          .from('events')
          .insert({
            title: data.title,
            description: data.description,
            event_date: data.event_date,
            location: data.location,
            event_type: data.event_type,
            team_id: data.team_id,
            is_home: data.is_home
          });

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Event created successfully',
        });
      }

      onSuccess();
    } catch (error) {
      logger.error('Error creating event:', error);
      toast({
        title: 'Error',
        description: 'Failed to create event. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create Event</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Title</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter event title" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Event description (optional)" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="event_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date & Time</FormLabel>
                    <FormControl>
                      <Input {...field} type="datetime-local" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Event location" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="event_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select event type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="training">Training</SelectItem>
                        <SelectItem value="match">Match</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="team_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Team</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select team" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {teams.map(team => (
                          <SelectItem key={team.id} value={team.id}>
                            {team.name} ({team.age_group})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="is_home"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Home Event</FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_recurring"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Recurring Event</FormLabel>
                  </div>
                </FormItem>
              )}
            />

            {isRecurring && (
              <div className="space-y-4 p-4 border rounded-lg bg-accent/50">
                <h3 className="font-medium">Recurrence Settings</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="recurrence_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Repeat</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="recurrence_interval"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Every</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number" 
                            min="1"
                            value={field.value || 1}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {recurrenceType === 'weekly' && (
                  <div>
                    <Label className="text-sm font-medium">Repeat on</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {DAYS_OF_WEEK.map(day => (
                        <Badge
                          key={day.value}
                          variant={selectedDays.includes(day.value) ? 'default' : 'outline'}
                          className="cursor-pointer"
                          onClick={() => handleDayToggle(day.value)}
                        >
                          {day.label}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="recurrence_end_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
                      <FormControl>
                        <Input {...field} type="date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? 'Creating...' : 'Create Event'}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default EnhancedEventForm;