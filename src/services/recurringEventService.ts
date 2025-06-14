import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';
import { addWeeks, addMonths, addDays, format } from 'date-fns';

interface RecurrencePattern {
  type: 'weekly' | 'biweekly' | 'monthly';
  interval: number;
  daysOfWeek: number[];
  endDate?: Date;
  maxOccurrences?: number;
}

interface EventData {
  title: string;
  event_date: string;
  location?: string;
  description?: string;
  event_type: string;
  team_id?: string;
  is_home?: boolean;
}

export class RecurringEventService {
  /**
   * Creates a recurring event series
   */
  static async createRecurringEvent(
    eventData: EventData,
    recurrencePattern: RecurrencePattern
  ) {
    try {
      // Create the parent event
      const { data: parentEvent, error: parentError } = await supabase
        .from('events')
        .insert({
          ...eventData,
          is_recurring: true,
          parent_event_id: null
        })
        .select()
        .single();

      if (parentError) throw parentError;

      // Create recurrence record
      const { error: recurrenceError } = await supabase
        .from('event_recurrence')
        .insert({
          parent_event_id: parentEvent.id,
          recurrence_type: recurrencePattern.type,
          recurrence_interval: recurrencePattern.interval,
          days_of_week: recurrencePattern.daysOfWeek,
          end_date: recurrencePattern.endDate?.toISOString().split('T')[0],
          max_occurrences: recurrencePattern.maxOccurrences
        });

      if (recurrenceError) throw recurrenceError;

      // Generate occurrence events
      const occurrences = this.generateOccurrences(
        new Date(eventData.event_date),
        recurrencePattern
      );

      const occurrenceEvents = occurrences.map((date, index) => ({
        ...eventData,
        event_date: date.toISOString(),
        is_recurring: false,
        parent_event_id: parentEvent.id,
        occurrence_date: date.toISOString().split('T')[0],
        title: `${eventData.title} (${index + 1})`
      }));

      if (occurrenceEvents.length > 0) {
        const { error: occurrencesError } = await supabase
          .from('events')
          .insert(occurrenceEvents);

        if (occurrencesError) throw occurrencesError;
      }

      logger.info(`Created recurring event series with ${occurrences.length} occurrences`);
      return { parentEvent, occurrenceCount: occurrences.length };

    } catch (error) {
      logger.error('Error creating recurring event:', error);
      throw error;
    }
  }

  /**
   * Updates a recurring event series
   */
  static async updateRecurringEvent(
    parentEventId: string,
    eventData: Partial<EventData>,
    recurrencePattern?: RecurrencePattern
  ) {
    try {
      // Update parent event
      const { error: updateError } = await supabase
        .from('events')
        .update(eventData)
        .eq('id', parentEventId);

      if (updateError) throw updateError;

      // If recurrence pattern is provided, update it
      if (recurrencePattern) {
        const { error: recurrenceUpdateError } = await supabase
          .from('event_recurrence')
          .update({
            recurrence_type: recurrencePattern.type,
            recurrence_interval: recurrencePattern.interval,
            days_of_week: recurrencePattern.daysOfWeek,
            end_date: recurrencePattern.endDate?.toISOString().split('T')[0],
            max_occurrences: recurrencePattern.maxOccurrences,
            updated_at: new Date().toISOString()
          })
          .eq('parent_event_id', parentEventId);

        if (recurrenceUpdateError) throw recurrenceUpdateError;

        // Regenerate occurrences
        await this.regenerateOccurrences(parentEventId);
      } else {
        // Just update existing occurrences with new event data
        const { error: occurrenceUpdateError } = await supabase
          .from('events')
          .update(eventData)
          .eq('parent_event_id', parentEventId);

        if (occurrenceUpdateError) throw occurrenceUpdateError;
      }

      logger.info(`Updated recurring event series: ${parentEventId}`);

    } catch (error) {
      logger.error('Error updating recurring event:', error);
      throw error;
    }
  }

  /**
   * Deletes a recurring event series
   */
  static async deleteRecurringEvent(parentEventId: string) {
    try {
      // Delete all occurrence events
      const { error: occurrenceDeleteError } = await supabase
        .from('events')
        .delete()
        .eq('parent_event_id', parentEventId);

      if (occurrenceDeleteError) throw occurrenceDeleteError;

      // Delete recurrence record (cascade will handle this)
      const { error: recurrenceDeleteError } = await supabase
        .from('event_recurrence')
        .delete()
        .eq('parent_event_id', parentEventId);

      if (recurrenceDeleteError) throw recurrenceDeleteError;

      // Delete parent event
      const { error: parentDeleteError } = await supabase
        .from('events')
        .delete()
        .eq('id', parentEventId);

      if (parentDeleteError) throw parentDeleteError;

      logger.info(`Deleted recurring event series: ${parentEventId}`);

    } catch (error) {
      logger.error('Error deleting recurring event:', error);
      throw error;
    }
  }

  /**
   * Regenerates occurrence events for a recurring series
   */
  private static async regenerateOccurrences(parentEventId: string) {
    try {
      // Get parent event and recurrence pattern
      const { data: parentEvent, error: parentError } = await supabase
        .from('events')
        .select('*, event_recurrence(*)')
        .eq('id', parentEventId)
        .single();

      if (parentError) throw parentError;
      if (!parentEvent.event_recurrence?.[0]) throw new Error('No recurrence pattern found');

      const pattern = parentEvent.event_recurrence[0];
      const recurrencePattern: RecurrencePattern = {
        type: pattern.recurrence_type as 'weekly' | 'biweekly' | 'monthly',
        interval: pattern.recurrence_interval,
        daysOfWeek: pattern.days_of_week || [],
        endDate: pattern.end_date ? new Date(pattern.end_date) : undefined,
        maxOccurrences: pattern.max_occurrences || undefined
      };

      // Delete existing occurrences
      const { error: deleteError } = await supabase
        .from('events')
        .delete()
        .eq('parent_event_id', parentEventId);

      if (deleteError) throw deleteError;

      // Generate new occurrences
      const occurrences = this.generateOccurrences(
        new Date(parentEvent.event_date),
        recurrencePattern
      );

      if (occurrences.length > 0) {
        const occurrenceEvents = occurrences.map((date, index) => ({
          title: `${parentEvent.title} (${index + 1})`,
          event_date: date.toISOString(),
          location: parentEvent.location,
          description: parentEvent.description,
          event_type: parentEvent.event_type,
          team_id: parentEvent.team_id,
          is_home: parentEvent.is_home,
          is_recurring: false,
          parent_event_id: parentEventId,
          occurrence_date: date.toISOString().split('T')[0]
        }));

        const { error: insertError } = await supabase
          .from('events')
          .insert(occurrenceEvents);

        if (insertError) throw insertError;
      }

      logger.info(`Regenerated ${occurrences.length} occurrences for event ${parentEventId}`);

    } catch (error) {
      logger.error('Error regenerating occurrences:', error);
      throw error;
    }
  }

  /**
   * Generates occurrence dates based on recurrence pattern
   */
  private static generateOccurrences(
    startDate: Date,
    pattern: RecurrencePattern
  ): Date[] {
    const occurrences: Date[] = [];
    let currentDate = new Date(startDate);
    const maxIterations = 100; // Safety limit
    let iterations = 0;

    while (iterations < maxIterations) {
      // Check if we've reached max occurrences
      if (pattern.maxOccurrences && occurrences.length >= pattern.maxOccurrences) {
        break;
      }

      // Check if we've reached end date
      if (pattern.endDate && currentDate > pattern.endDate) {
        break;
      }

      // Check if current date matches pattern
      if (this.dateMatchesPattern(currentDate, pattern)) {
        occurrences.push(new Date(currentDate));
      }

      // Move to next date based on pattern
      currentDate = this.getNextDate(currentDate, pattern);
      iterations++;
    }

    return occurrences;
  }

  /**
   * Checks if a date matches the recurrence pattern
   */
  private static dateMatchesPattern(date: Date, pattern: RecurrencePattern): boolean {
    switch (pattern.type) {
      case 'weekly':
      case 'biweekly':
        return pattern.daysOfWeek.includes(date.getDay());
      case 'monthly':
        return true; // Monthly events occur on the same date each month
      default:
        return false;
    }
  }

  /**
   * Gets the next date in the sequence
   */
  private static getNextDate(currentDate: Date, pattern: RecurrencePattern): Date {
    switch (pattern.type) {
      case 'weekly':
        return addWeeks(currentDate, pattern.interval);
      case 'biweekly':
        return addWeeks(currentDate, pattern.interval * 2);
      case 'monthly':
        return addMonths(currentDate, pattern.interval);
      default:
        return addDays(currentDate, 1);
    }
  }

  /**
   * Gets recurrence information for an event
   */
  static async getRecurrenceInfo(eventId: string) {
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          event_recurrence(*)
        `)
        .eq('id', eventId)
        .single();

      if (error) throw error;
      return data;

    } catch (error) {
      logger.error('Error getting recurrence info:', error);
      return null;
    }
  }
}