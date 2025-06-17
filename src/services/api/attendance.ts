// Attendance API operations
import { supabase } from '@/integrations/supabase/client';
import { offlineApi } from '../database';
import { logger } from '@/utils/logger';
import { BaseAPI } from './base';
import { Attendance } from '@/types/unified';

interface RawEventResponse {
  player_id: string | null;
  event_id: string | null;
  attendance_status: string | null;
  rsvp_status: string | null;
  notes?: string | null;
  // Add other fields from 'event_responses' table if selected by '*' and needed
  id?: string; // Assuming 'id' from event_responses might be used or is part of '*'
}

function toAttendanceStatus(status: string | null): 'present' | 'absent' | 'injured' | 'late' {
  const validStatus = ['present', 'absent', 'injured', 'late'];
  if (status && validStatus.includes(status)) {
    return status as 'present' | 'absent' | 'injured' | 'late';
  }
  // Consider a default or throw error if status is critical and must be one of these
  return 'absent'; // Default status if null or invalid
}

function toRsvpStatus(status: string | null): 'going' | 'not_going' | 'maybe' {
  const validStatus = ['going', 'not_going', 'maybe'];
  if (status && validStatus.includes(status)) {
    return status as 'going' | 'not_going' | 'maybe';
  }
  return 'maybe'; // Default RSVP if null or invalid
}

function mapRawToAttendance(raw: RawEventResponse): Attendance {
  // Ensure essential fields are present, otherwise this record might be problematic
  if (!raw.player_id || !raw.event_id) {
    logger.error('mapRawToAttendance: player_id or event_id is missing', raw);
    // Depending on how you want to handle this, you could throw an error
    // or return a specific object indicating an invalid record.
    // For now, we'll try to create an Attendance object with defaults for required fields.
  }
  return {
    childId: raw.player_id || 'MISSING_CHILD_ID',
    eventId: raw.event_id || 'MISSING_EVENT_ID',
    status: toAttendanceStatus(raw.attendance_status),
    rsvp: toRsvpStatus(raw.rsvp_status),
    notes: raw.notes || undefined,
  };
}

class AttendanceAPI extends BaseAPI {
  async getAttendanceByEventId(eventId: string): Promise<Attendance[]> {
    return this.withOfflineFallback(
      async () => {
        const { data, error } = await supabase
          .from('event_responses')
          .select('player_id, event_id, attendance_status, rsvp_status, notes') // Select specific fields
          .eq('event_id', eventId);
        
        if (error) throw error;
        
        const rawData = data as RawEventResponse[] || [];
        return rawData.map(mapRawToAttendance);
      },
      () => offlineApi.getAttendanceByEventId(eventId), // Assuming offlineApi returns Attendance[]
      'getAttendanceByEventId'
    );
  }

  async createAttendance(attendance: Attendance): Promise<Attendance> {
    if (this.isOnline) {
      try {
        const { data, error } = await supabase
          .from('event_responses')
          .insert({
            player_id: attendance.childId,
            event_id: attendance.eventId,
            attendance_status: attendance.status,
            rsvp_status: attendance.rsvp
          })
          .select()
          .single();
        
        if (error) throw error;
        
        // data here is a single raw response object
        return mapRawToAttendance(data as RawEventResponse);
      } catch (error) {
        logger.warn('Create attendance failed online, saving offline:', error);
      }
    }
    
    // Fallback to offline storage
    return attendance;
  }

  async updateAttendance(childId: string, eventId: string, updates: Partial<Attendance>): Promise<Attendance | undefined> {
    if (this.isOnline) {
      try {
        const updateData: any = {};
        if (updates.status) updateData.attendance_status = updates.status;
        if (updates.rsvp) updateData.rsvp_status = updates.rsvp;
        
        const { data, error } = await supabase
          .from('event_responses')
          .update(updateData)
          .eq('player_id', childId)
          .eq('event_id', eventId)
          .select()
          .single();
        
        if (error) throw error;
        
        return mapRawToAttendance(data as RawEventResponse);
      } catch (error) {
        logger.warn('Update attendance failed online:', error);
        throw error;
      }
    }
    
    return undefined;
  }
}

export const attendanceApi = new AttendanceAPI();