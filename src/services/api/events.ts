// Event API operations
import { supabase } from '@/integrations/supabase/client';
import { offlineApi } from '../database';
import { logger } from '@/utils/logger';
import { BaseAPI } from './base';
import { Event } from '@/types/unified';

class EventAPI extends BaseAPI {
  async getEvents(): Promise<Event[]> {
    return this.withOfflineFallback(
      async () => {
        const { data, error } = await supabase
          .from('events')
          .select('*');
        
        if (error) throw error;
        
        return data?.map(event => ({
          id: event.id,
          name: event.title,
          date: event.event_date,
          time: '00:00', // Default time since not stored separately
          location: event.location || '',
          notes: event.description || '',
          eventType: event.event_type as 'training' | 'match' | 'social' | 'meeting' | 'other',
          teamId: event.team_id || ''
        } as Event)) || [];
      },
      () => offlineApi.getEvents(),
      'getEvents'
    );
  }

  async getEventById(id: string): Promise<Event | undefined> {
    return this.withOfflineFallback(
      async () => {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('id', id)
          .maybeSingle();
        
        if (error || !data) return undefined;
        
        return {
          id: data.id,
          name: data.title,
          date: data.event_date,
          time: '00:00',
          location: data.location || '',
          notes: data.description || '',
          eventType: data.event_type as 'training' | 'match' | 'social' | 'meeting' | 'other',
          teamId: data.team_id || ''
        } as Event;
      },
      () => offlineApi.getEventById(id),
      'getEventById'
    );
  }

  async createEvent(event: Omit<Event, 'id'>): Promise<Event> {
    if (this.isOnline) {
      try {
        const { data, error } = await supabase
          .from('events')
          .insert({
            title: event.name,
            event_date: new Date(`${event.date}T${event.time}`).toISOString(),
            location: event.location,
            description: event.notes,
            event_type: event.eventType,
            team_id: event.teamId || null
          })
          .select()
          .single();
        
        if (error) throw error;
        
        return {
          id: data.id,
          name: data.title,
          date: event.date,
          time: event.time,
          location: data.location || '',
          notes: data.description || '',
          eventType: data.event_type as 'training' | 'match' | 'social' | 'meeting' | 'other',
          teamId: data.team_id || ''
        };
      } catch (error) {
        logger.warn('Create event failed online, saving offline:', error);
      }
    }
    
    return offlineApi.createEvent(event);
  }

  async updateEvent(id: string, updates: Partial<Omit<Event, 'id'>>): Promise<Event | undefined> {
    if (this.isOnline) {
      try {
        const updateData: any = {};
        if (updates.name) updateData.title = updates.name;
        if (updates.date && updates.time) {
          updateData.event_date = new Date(`${updates.date}T${updates.time}`).toISOString();
        }
        if (updates.location) updateData.location = updates.location;
        if (updates.notes) updateData.description = updates.notes;
        if (updates.eventType) updateData.event_type = updates.eventType;
        if (updates.teamId !== undefined) updateData.team_id = updates.teamId || null;
        
        const { data, error } = await supabase
          .from('events')
          .update(updateData)
          .eq('id', id)
          .select()
          .single();
        
        if (error) throw error;
        
        return {
          id: data.id,
          name: data.title,
          date: updates.date || data.event_date.split('T')[0],
          time: updates.time || '00:00',
          location: data.location || '',
          notes: data.description || '',
          eventType: data.event_type as 'training' | 'match' | 'social' | 'meeting' | 'other',
          teamId: data.team_id || ''
        };
      } catch (error) {
        logger.warn('Update event failed online, saving offline:', error);
      }
    }
    
    return offlineApi.updateEvent(id, updates);
  }

  async deleteEvent(id: string): Promise<boolean> {
    if (this.isOnline) {
      try {
        const { error } = await supabase
          .from('events')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        
        return true;
      } catch (error) {
        logger.warn('Delete event failed online:', error);
        throw error;
      }
    }
    
    // Offline fallback
    try {
      await offlineApi.deleteEvent(id);
      return true;
    } catch {
      return false;
    }
  }
}

export const eventApi = new EventAPI();