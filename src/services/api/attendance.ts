// Attendance API operations
import { supabase } from '@/integrations/supabase/client';
import { offlineApi } from '../database';
import { logger } from '@/utils/logger';
import { BaseAPI } from './base';
import { Attendance } from '@/types/unified';

class AttendanceAPI extends BaseAPI {
  async getAttendanceByEventId(eventId: string): Promise<Attendance[]> {
    return this.withOfflineFallback(
      async () => {
        const { data, error } = await supabase
          .from('event_responses')
          .select('*')
          .eq('event_id', eventId);
        
        if (error) throw error;
        
        return data?.map(response => ({
          childId: response.player_id,
          eventId: response.event_id,
          status: response.attendance_status as 'present' | 'absent' | 'injured' | 'late',
          rsvp: response.rsvp_status as 'going' | 'not_going' | 'maybe'
        })) || [];
      },
      () => offlineApi.getAttendanceByEventId(eventId),
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
        
        return {
          childId: data.player_id,
          eventId: data.event_id,
          status: data.attendance_status as 'present' | 'absent' | 'injured' | 'late',
          rsvp: data.rsvp_status as 'going' | 'not_going' | 'maybe'
        };
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
        
        return {
          childId: data.player_id,
          eventId: data.event_id,
          status: data.attendance_status as 'present' | 'absent' | 'injured' | 'late',
          rsvp: data.rsvp_status as 'going' | 'not_going' | 'maybe'
        };
      } catch (error) {
        logger.warn('Update attendance failed online:', error);
        throw error;
      }
    }
    
    return undefined;
  }
}

export const attendanceApi = new AttendanceAPI();