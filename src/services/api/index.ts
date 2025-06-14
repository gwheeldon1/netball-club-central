// Unified API service - single point of entry for all data operations
import { supabase } from '@/integrations/supabase/client';
import { offlineApi } from '@/services/database';
import { apiClient } from './client';
import { logger } from '@/utils/logger';
import {
  ApiResponse,
  UserCreateRequest,
  UserUpdateRequest,
  ChildCreateRequest,
  ChildUpdateRequest,
  TeamCreateRequest,
  TeamUpdateRequest,
  EventCreateRequest,
  EventUpdateRequest,
  AttendanceUpdateRequest,
} from './types';
import { User, Child, Team, Event, Attendance, UserRole } from '@/types';
import { 
  DatabaseGuardian, 
  DatabasePlayer, 
  DatabaseTeam, 
  DatabaseEvent, 
  DatabaseEventResponse 
} from '@/types/database-enhanced';

class UnifiedApiService {
  // User operations
  async getUsers(): Promise<ApiResponse<DatabaseGuardian[]>> {
    return apiClient.supabaseQuery(
      supabase.from('guardians').select('*'),
      'getUsers'
    );
  }

  async getUserById(id: string): Promise<ApiResponse<DatabaseGuardian | null>> {
    // Try online first, fallback to offline
    const onlineResult = await apiClient.supabaseQuery<DatabaseGuardian | null>(
      supabase.from('guardians').select('*').eq('id', id).maybeSingle(),
      'getUserById',
      false
    );

    if (onlineResult.success && onlineResult.data) {
      return onlineResult;
    }

    // Fallback to offline data
    try {
      const offlineUser = await offlineApi.getUserById(id);
      return {
        data: offlineUser as unknown as DatabaseGuardian,
        success: !!offlineUser,
      };
    } catch (error) {
      logger.error('Failed to get user from offline storage:', error);
      return {
        error: 'User not found',
        success: false,
      };
    }
  }

  async createUser(userData: UserCreateRequest): Promise<ApiResponse<DatabaseGuardian>> {
    const result = await apiClient.supabaseQuery<DatabaseGuardian>(
      supabase.from('guardians').insert(userData).select().single(),
      'createUser'
    );

    // If offline, queue for sync
    if (!result.success && !apiClient.getOnlineStatus()) {
      try {
        // Convert to format expected by offline API
        const offlineUserData = {
          name: `${userData.first_name} ${userData.last_name}`,
          email: userData.email || '',
          phone: userData.phone,
          roles: ['parent'] as UserRole[],
        };
        const offlineUser = await offlineApi.createUser(offlineUserData);
        return {
          data: offlineUser as unknown as DatabaseGuardian,
          success: true,
        };
      } catch (error) {
        logger.error('Failed to create user offline:', error);
        return result as ApiResponse<DatabaseGuardian>;
      }
    }

    return result;
  }

  async updateUser(id: string, userData: UserUpdateRequest): Promise<ApiResponse<DatabaseGuardian>> {
    const result = await apiClient.supabaseQuery<DatabaseGuardian>(
      supabase.from('guardians').update(userData).eq('id', id).select().single(),
      'updateUser'
    );

    // If offline, queue for sync
    if (!result.success && !apiClient.getOnlineStatus()) {
      try {
        const offlineUser = await offlineApi.updateUser(id, userData);
        return {
          data: offlineUser as unknown as DatabaseGuardian,
          success: true,
        };
      } catch (error) {
        logger.error('Failed to update user offline:', error);
        return result as ApiResponse<DatabaseGuardian>;
      }
    }

    return result;
  }

  async deleteUser(id: string): Promise<ApiResponse<void>> {
    return apiClient.supabaseQuery(
      supabase.from('guardians').delete().eq('id', id),
      'deleteUser'
    );
  }

  // Child operations
  async getChildren(): Promise<ApiResponse<any[]>> {
    return apiClient.supabaseQuery(
      supabase.from('players').select('*'),
      'getChildren'
    );
  }

  async getChildById(id: string): Promise<ApiResponse<any | null>> {
    return apiClient.supabaseQuery(
      supabase.from('players').select('*').eq('id', id).maybeSingle(),
      'getChildById'
    );
  }

  async createChild(childData: ChildCreateRequest): Promise<ApiResponse<any>> {
    const result = await apiClient.supabaseQuery(
      supabase.from('players').insert(childData).select().single(),
      'createChild'
    );

    // If offline, queue for sync
    if (!result.success && !apiClient.getOnlineStatus()) {
      try {
        // Convert to format expected by offline API
        const offlineChildData = {
          name: `${childData.first_name} ${childData.last_name}`,
          dateOfBirth: childData.date_of_birth || '',
          parentId: 'temp-parent-id', // Will be resolved during sync
          status: 'pending' as const,
          medicalInfo: childData.medical_conditions,
          notes: childData.additional_medical_notes,
        };
        const offlineChild = await offlineApi.createChild(offlineChildData);
        return {
          data: offlineChild,
          success: true,
        };
      } catch (error) {
        logger.error('Failed to create child offline:', error);
        return result;
      }
    }

    return result;
  }

  async updateChild(id: string, childData: ChildUpdateRequest): Promise<ApiResponse<any>> {
    return apiClient.supabaseQuery(
      supabase.from('players').update(childData).eq('id', id).select().single(),
      'updateChild'
    );
  }

  // Team operations
  async getTeams(): Promise<ApiResponse<any[]>> {
    return apiClient.supabaseQuery(
      supabase.from('teams').select('*'),
      'getTeams'
    );
  }

  async getTeamById(id: string): Promise<ApiResponse<any | null>> {
    return apiClient.supabaseQuery(
      supabase.from('teams').select('*').eq('id', id).maybeSingle(),
      'getTeamById'
    );
  }

  async createTeam(teamData: TeamCreateRequest): Promise<ApiResponse<any>> {
    const result = await apiClient.supabaseQuery(
      supabase.from('teams').insert(teamData).select().single(),
      'createTeam'
    );

    // If offline, queue for sync
    if (!result.success && !apiClient.getOnlineStatus()) {
      try {
        // Convert to format expected by offline API
        const offlineTeamData = {
          name: teamData.name,
          ageGroup: teamData.age_group,
          category: 'Junior' as const,
          description: '',
        };
        const offlineTeam = await offlineApi.createTeam(offlineTeamData);
        return {
          data: offlineTeam,
          success: true,
        };
      } catch (error) {
        logger.error('Failed to create team offline:', error);
        return result;
      }
    }

    return result;
  }

  async updateTeam(id: string, teamData: TeamUpdateRequest): Promise<ApiResponse<any>> {
    return apiClient.supabaseQuery(
      supabase.from('teams').update(teamData).eq('id', id).select().single(),
      'updateTeam'
    );
  }

  async deleteTeam(id: string): Promise<ApiResponse<void>> {
    return apiClient.supabaseQuery(
      supabase.from('teams').delete().eq('id', id),
      'deleteTeam'
    );
  }

  // Event operations
  async getEvents(): Promise<ApiResponse<any[]>> {
    return apiClient.supabaseQuery(
      supabase.from('events').select('*'),
      'getEvents'
    );
  }

  async getEventById(id: string): Promise<ApiResponse<any | null>> {
    return apiClient.supabaseQuery(
      supabase.from('events').select('*').eq('id', id).maybeSingle(),
      'getEventById'
    );
  }

  async createEvent(eventData: EventCreateRequest): Promise<ApiResponse<any>> {
    return apiClient.supabaseQuery(
      supabase.from('events').insert(eventData).select().single(),
      'createEvent'
    );
  }

  async updateEvent(id: string, eventData: EventUpdateRequest): Promise<ApiResponse<any>> {
    return apiClient.supabaseQuery(
      supabase.from('events').update(eventData).eq('id', id).select().single(),
      'updateEvent'
    );
  }

  async deleteEvent(id: string): Promise<ApiResponse<void>> {
    return apiClient.supabaseQuery(
      supabase.from('events').delete().eq('id', id),
      'deleteEvent'
    );
  }

  // Attendance operations
  async getEventAttendance(eventId: string): Promise<ApiResponse<any[]>> {
    return apiClient.supabaseQuery(
      supabase.from('event_responses').select('*').eq('event_id', eventId),
      'getEventAttendance'
    );
  }

  async updateAttendance(
    eventId: string,
    playerId: string,
    attendanceData: AttendanceUpdateRequest
  ): Promise<ApiResponse<any>> {
    return apiClient.supabaseQuery(
      supabase.from('event_responses')
        .upsert({
          event_id: eventId,
          player_id: playerId,
          attendance_status: attendanceData.status,
          rsvp_status: attendanceData.rsvp,
        })
        .select()
        .single(),
      'updateAttendance'
    );
  }

  // Utility methods
  getOnlineStatus(): boolean {
    return apiClient.getOnlineStatus();
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<{ status: string; timestamp: string }>> {
    return apiClient.request(async () => {
      // Simple query to test connection
      const { error } = await supabase.from('teams').select('id').limit(1);
      if (error) throw error;
      
      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
      };
    }, 'healthCheck', false);
  }
}

// Export singleton instance
export const api = new UnifiedApiService();

// Export types for consumers
export * from './types';