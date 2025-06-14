import { supabase } from "@/integrations/supabase/client";
import { addDays, addWeeks, addMonths, format, parseISO } from "date-fns";

export interface RecurringEventData {
  title: string;
  description?: string;
  event_date: string;
  location?: string;
  event_type: string;
  team_id: string;
  is_home?: boolean;
  recurrence_type: 'daily' | 'weekly' | 'monthly';
  recurrence_interval: number;
  recurrence_days?: string[]; // For weekly recurrence
  recurrence_end_date: string;
}

export const createRecurringEvents = async (eventData: RecurringEventData) => {
  try {
    const startDate = parseISO(eventData.event_date);
    const endDate = parseISO(eventData.recurrence_end_date);
    
    // Create the parent event first
    const { data: parentEvent, error: parentError } = await supabase
      .from('events')
      .insert({
        title: eventData.title,
        description: eventData.description,
        event_date: eventData.event_date,
        location: eventData.location,
        event_type: eventData.event_type,
        team_id: eventData.team_id,
        is_home: eventData.is_home,
        recurrence_type: eventData.recurrence_type,
        recurrence_interval: eventData.recurrence_interval,
        recurrence_days: eventData.recurrence_days,
        recurrence_end_date: eventData.recurrence_end_date,
        parent_event_id: null
      })
      .select()
      .single();

    if (parentError) throw parentError;

    // Generate recurring events
    const recurringEvents = [];
    let currentDate = startDate;

    while (currentDate <= endDate) {
      // Skip the first occurrence (parent event)
      if (currentDate.getTime() !== startDate.getTime()) {
        // For weekly recurrence, check if current day matches recurrence_days
        if (eventData.recurrence_type === 'weekly' && eventData.recurrence_days) {
          const dayName = format(currentDate, 'EEEE').toLowerCase();
          if (eventData.recurrence_days.includes(dayName)) {
            recurringEvents.push({
              title: eventData.title,
              description: eventData.description,
              event_date: currentDate.toISOString(),
              location: eventData.location,
              event_type: eventData.event_type,
              team_id: eventData.team_id,
              is_home: eventData.is_home,
              parent_event_id: parentEvent.id
            });
          }
        } else {
          // For daily and monthly recurrence
          recurringEvents.push({
            title: eventData.title,
            description: eventData.description,
            event_date: currentDate.toISOString(),
            location: eventData.location,
            event_type: eventData.event_type,
            team_id: eventData.team_id,
            is_home: eventData.is_home,
            parent_event_id: parentEvent.id
          });
        }
      }

      // Calculate next date based on recurrence type
      switch (eventData.recurrence_type) {
        case 'daily':
          currentDate = addDays(currentDate, eventData.recurrence_interval);
          break;
        case 'weekly':
          currentDate = addWeeks(currentDate, eventData.recurrence_interval);
          break;
        case 'monthly':
          currentDate = addMonths(currentDate, eventData.recurrence_interval);
          break;
      }
    }

    // Insert all recurring events
    if (recurringEvents.length > 0) {
      const { error: recurringError } = await supabase
        .from('events')
        .insert(recurringEvents);

      if (recurringError) throw recurringError;
    }

    return { success: true, parentEvent, recurringCount: recurringEvents.length };
  } catch (error) {
    console.error('Error creating recurring events:', error);
    throw error;
  }
};

export const updateRecurringSeries = async (
  parentEventId: string, 
  updates: Partial<RecurringEventData>,
  updateType: 'this_only' | 'this_and_future' | 'all_series'
) => {
  try {
    if (updateType === 'this_only') {
      // Update only the specific event
      const { error } = await supabase
        .from('events')
        .update(updates)
        .eq('id', parentEventId);
      
      if (error) throw error;
    } else if (updateType === 'all_series') {
      // Update parent and all child events
      const { error: parentError } = await supabase
        .from('events')
        .update(updates)
        .eq('id', parentEventId);
      
      if (parentError) throw parentError;

      const { error: childrenError } = await supabase
        .from('events')
        .update(updates)
        .eq('parent_event_id', parentEventId);
      
      if (childrenError) throw childrenError;
    }

    return { success: true };
  } catch (error) {
    console.error('Error updating recurring series:', error);
    throw error;
  }
};

export const deleteRecurringSeries = async (
  eventId: string,
  deleteType: 'this_only' | 'this_and_future' | 'all_series'
) => {
  try {
    if (deleteType === 'this_only') {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);
      
      if (error) throw error;
    } else if (deleteType === 'all_series') {
      // Get parent event ID if this is a child event
      const { data: event } = await supabase
        .from('events')
        .select('parent_event_id')
        .eq('id', eventId)
        .single();

      const parentId = event?.parent_event_id || eventId;

      // Delete all child events first
      const { error: childrenError } = await supabase
        .from('events')
        .delete()
        .eq('parent_event_id', parentId);
      
      if (childrenError) throw childrenError;

      // Delete parent event
      const { error: parentError } = await supabase
        .from('events')
        .delete()
        .eq('id', parentId);
      
      if (parentError) throw parentError;
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting recurring series:', error);
    throw error;
  }
};