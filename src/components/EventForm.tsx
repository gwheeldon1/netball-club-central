import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

import { Event, Team } from "@/types";
import { api } from "@/services/unifiedApi";
import { logger } from "@/utils/logger";
import { RecurringEventForm } from "@/components/events/RecurringEventForm";
import { RecurringEventService } from "@/services/recurringEventService";

const eventSchema = z.object({
  name: z.string().min(2, { message: "Event name must be at least 2 characters" }),
  eventType: z.enum(["match", "training", "social", "meeting"], {
    required_error: "Please select an event type",
  }),
  date: z.string().min(1, { message: "Date is required" }),
  time: z.string().min(1, { message: "Time is required" }),
  location: z.string().min(1, { message: "Location is required" }),
  teamId: z.string().min(1, { message: "Team is required" }),
  description: z.string().optional(),
  opponent: z.string().optional(),
  isHome: z.boolean().optional(),
  requiresRSVP: z.boolean().optional(),
});

type EventFormValues = z.infer<typeof eventSchema>;

interface EventFormProps {
  event?: Event;
  mode: "create" | "edit";
}

const EventForm = ({ event, mode }: EventFormProps) => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loadingTeams, setLoadingTeams] = useState(true);
  const [recurrencePattern, setRecurrencePattern] = useState<any>(null);

  // Initialize form with existing event data or defaults
  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: event ? {
      name: event.name,
      eventType: event.eventType as any,
      date: event.date,
      time: event.time,
      location: event.location,
      teamId: event.teamId,
      description: event.description || "",
      opponent: event.opponent || "",
      isHome: event.isHome || false,
      requiresRSVP: event.requiresRSVP || true,
    } : {
      name: "",
      eventType: "training" as const,
      date: "",
      time: "",
      location: "",
      teamId: "",
      description: "",
      opponent: "",
      isHome: false,
      requiresRSVP: true,
    },
  });

  // Load teams for selection
  useEffect(() => {
    const loadTeams = async () => {
      try {
        const teamsData = await api.getTeams();
        setTeams(teamsData);
      } catch (error) {
        logger.error("Error loading teams:", error);
        toast.error("Failed to load teams");
      } finally {
        setLoadingTeams(false);
      }
    };

    loadTeams();
  }, []);

  // Watch event type to show/hide opponent field
  const eventType = form.watch("eventType");

  const onSubmit = async (data: EventFormValues) => {
    setIsSubmitting(true);

    try {
      const eventDateTime = `${data.date}T${data.time}:00`;
      
      if (mode === "create") {
        if (recurrencePattern) {
          // Create recurring event
          const result = await RecurringEventService.createRecurringEvent({
            title: data.name,
            event_date: eventDateTime,
            location: data.location,
            description: data.description,
            event_type: data.eventType,
            team_id: data.teamId,
            is_home: data.isHome,
          }, recurrencePattern);
          
          toast.success(`Recurring event created with ${result.occurrenceCount} occurrences`);
          navigate(`/events/${result.parentEvent.id}`);
        } else {
          // Create single event
          const newEvent = await api.createEvent({
            name: data.name,
            eventType: data.eventType,
            date: data.date,
            time: data.time,
            location: data.location,
            teamId: data.teamId,
            description: data.description,
            opponent: data.opponent,
            isHome: data.isHome,
            requiresRSVP: data.requiresRSVP,
          });
          toast.success("Event created successfully");
          navigate(`/events/${newEvent.id}`);
        }
      } else if (event) {
        const updatedEvent = await api.updateEvent(event.id, {
          name: data.name,
          eventType: data.eventType,
          date: data.date,
          time: data.time,
          location: data.location,
          teamId: data.teamId,
          description: data.description,
          opponent: data.opponent,
          isHome: data.isHome,
          requiresRSVP: data.requiresRSVP,
        });

        if (updatedEvent) {
          toast.success("Event updated successfully");
          navigate(`/events/${updatedEvent.id}`);
        } else {
          toast.error("Failed to update event");
        }
      }
    } catch (error) {
      logger.error("Error saving event:", error);
      toast.error("Failed to save event. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingTeams) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Event Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter event name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="eventType"
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
                    <SelectItem value="social">Social Event</SelectItem>
                    <SelectItem value="meeting">Team Meeting</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Time</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input placeholder="Enter event location" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="teamId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Team</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a team" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {eventType === "match" && (
          <div className="grid gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="opponent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Opponent</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter opponent team name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isHome"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border rounded-md">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Home Game</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Check if this is a home game
                    </p>
                  </div>
                </FormItem>
              )}
            />
          </div>
        )}

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter event description (optional)"
                  className="min-h-32"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="requiresRSVP"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border rounded-md">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Requires RSVP</FormLabel>
                <p className="text-sm text-muted-foreground">
                  Players must respond to confirm attendance
                </p>
              </div>
            </FormItem>
          )}
        />

        {mode === "create" && (
          <RecurringEventForm
            onRecurrenceChange={setRecurrencePattern}
            eventDate={form.watch("date") ? new Date(form.watch("date")) : new Date()}
          />
        )}

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : mode === "create" ? "Create Event" : "Update Event"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default EventForm;