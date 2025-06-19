
import { supabase } from '@/integrations/supabase/client';
import { offlineApi } from './database';
import { logger } from '@/utils/logger';
import { Team, Event, Child } from '@/types';

class UnifiedAPI {
  private get isOnline() {
    return navigator.onLine;
  }

  // Teams
  async getTeams(): Promise<Team[]> {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('archived', false)
        .order('name');

      if (error) throw error;
      
      return data?.map(team => ({
        id: team.id,
        name: team.name,
        ageGroup: team.age_group,
        category: 'Junior' as 'Junior' | 'Senior' | 'Mixed', // Default mapping
        description: team.description,
        season_year: team.season_year,
        created_at: team.created_at
      })) || [];
    } catch (error) {
      logger.error('Error fetching teams:', error);
      throw error;
    }
  }

  async getTeamById(id: string): Promise<Team | undefined> {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      return {
        id: data.id,
        name: data.name,
        ageGroup: data.age_group,
        category: 'Junior' as 'Junior' | 'Senior' | 'Mixed',
        description: data.description,
        season_year: data.season_year,
        created_at: data.created_at
      };
    } catch (error) {
      logger.error('Error fetching team:', error);
      return undefined;
    }
  }

  async createTeam(team: Omit<Team, 'id'>): Promise<Team> {
    try {
      const { data, error } = await supabase
        .from('teams')
        .insert({
          name: team.name,
          age_group: team.ageGroup,
          description: team.description,
          season_year: team.season_year
        })
        .select()
        .single();

      if (error) throw error;
      
      return {
        id: data.id,
        name: data.name,
        ageGroup: data.age_group,
        category: 'Junior' as 'Junior' | 'Senior' | 'Mixed',
        description: data.description,
        season_year: data.season_year,
        created_at: data.created_at
      };
    } catch (error) {
      logger.error('Error creating team:', error);
      throw error;
    }
  }

  async updateTeam(id: string, updates: Partial<Team>): Promise<Team | undefined> {
    try {
      const updateData: any = {};
      if (updates.name) updateData.name = updates.name;
      if (updates.ageGroup) updateData.age_group = updates.ageGroup;
      if (updates.description) updateData.description = updates.description;
      if (updates.season_year) updateData.season_year = updates.season_year;

      const { data, error } = await supabase
        .from('teams')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      return {
        id: data.id,
        name: data.name,
        ageGroup: data.age_group,
        category: 'Junior' as 'Junior' | 'Senior' | 'Mixed',
        description: data.description,
        season_year: data.season_year,
        created_at: data.created_at
      };
    } catch (error) {
      logger.error('Error updating team:', error);
      return undefined;
    }
  }

  async deleteTeam(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      logger.error('Error deleting team:', error);
      return false;
    }
  }

  // Events
  async getEvents(): Promise<Event[]> {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('event_date');

      if (error) throw error;
      
      return data?.map(event => ({
        id: event.id,
        name: event.title,
        date: event.event_date?.split('T')[0] || '',
        time: event.event_date ? new Date(event.event_date).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }) : '00:00',
        location: event.location || '',
        notes: event.description || '',
        eventType: event.event_type as 'training' | 'match' | 'social' | 'meeting' | 'other',
        teamId: event.team_id || '',
        isHome: event.is_home || false,
        requiresRSVP: true // Default value since field doesn't exist in DB
      })) || [];
    } catch (error) {
      logger.error('Error fetching events:', error);
      throw error;
    }
  }

  async getEventById(id: string): Promise<Event | undefined> {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) return undefined;
      
      return {
        id: data.id,
        name: data.title,
        date: data.event_date?.split('T')[0] || '',
        time: data.event_date ? new Date(data.event_date).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }) : '00:00',
        location: data.location || '',
        notes: data.description || '',
        eventType: data.event_type as 'training' | 'match' | 'social' | 'meeting' | 'other',
        teamId: data.team_id || '',
        isHome: data.is_home || false,
        requiresRSVP: true
      };
    } catch (error) {
      logger.error('Error fetching event:', error);
      return undefined;
    }
  }

  async createEvent(event: Omit<Event, 'id'>): Promise<Event> {
    try {
      const { data, error } = await supabase
        .from('events')
        .insert({
          title: event.name,
          event_date: new Date(`${event.date}T${event.time}`).toISOString(),
          location: event.location,
          description: event.notes,
          event_type: event.eventType,
          team_id: event.teamId || null,
          is_home: event.isHome
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
        teamId: data.team_id || '',
        isHome: data.is_home || false,
        requiresRSVP: true
      };
    } catch (error) {
      logger.error('Error creating event:', error);
      throw error;
    }
  }

  async updateEvent(id: string, updates: Partial<Omit<Event, 'id'>>): Promise<Event | undefined> {
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
      if (updates.isHome !== undefined) updateData.is_home = updates.isHome;
      
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
        date: updates.date || data.event_date?.split('T')[0] || '',
        time: updates.time || (data.event_date ? new Date(data.event_date).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }) : '00:00'),
        location: data.location || '',
        notes: data.description || '',
        eventType: data.event_type as 'training' | 'match' | 'social' | 'meeting' | 'other',
        teamId: data.team_id || '',
        isHome: data.is_home || false,
        requiresRSVP: true
      };
    } catch (error) {
      logger.error('Error updating event:', error);
      return undefined;
    }
  }

  async deleteEvent(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      logger.error('Error deleting event:', error);
      return false;
    }
  }

  // Children
  async getChildren(): Promise<Child[]> {
    try {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .order('first_name');

      if (error) throw error;
      
      return data?.map(player => ({
        id: player.id,
        name: `${player.first_name} ${player.last_name}`,
        dateOfBirth: player.date_of_birth || '',
        medicalInfo: player.medical_conditions || '',
        notes: player.additional_medical_notes || '',
        profileImage: player.profile_image || '',
        teamId: '',
        ageGroup: '',
        parentId: '',
        status: player.approval_status as 'pending' | 'approved' | 'rejected'
      })) || [];
    } catch (error) {
      logger.error('Error fetching children:', error);
      throw error;
    }
  }

  async getChildrenByTeamId(teamId: string): Promise<Child[]> {
    try {
      const { data, error } = await supabase
        .from('players')
        .select(`
          *,
          player_teams!inner(team_id)
        `)
        .eq('player_teams.team_id', teamId)
        .order('first_name');

      if (error) throw error;
      
      return data?.map(player => ({
        id: player.id,
        name: `${player.first_name} ${player.last_name}`,
        dateOfBirth: player.date_of_birth || '',
        medicalInfo: player.medical_conditions || '',
        notes: player.additional_medical_notes || '',
        profileImage: player.profile_image || '',
        teamId: teamId,
        ageGroup: '',
        parentId: '',
        status: player.approval_status as 'pending' | 'approved' | 'rejected'
      })) || [];
    } catch (error) {
      logger.error('Error fetching children by team:', error);
      throw error;
    }
  }

  async createChild(child: Omit<Child, 'id'>): Promise<Child> {
    try {
      const [firstName, ...lastNameParts] = child.name.split(' ');
      const lastName = lastNameParts.join(' ') || '';

      const { data, error } = await supabase
        .from('players')
        .insert({
          first_name: firstName,
          last_name: lastName,
          date_of_birth: child.dateOfBirth,
          medical_conditions: child.medicalInfo,
          additional_medical_notes: child.notes,
          profile_image: child.profileImage,
          approval_status: child.status
        })
        .select()
        .single();

      if (error) throw error;
      
      return {
        id: data.id,
        name: `${data.first_name} ${data.last_name}`,
        dateOfBirth: data.date_of_birth || '',
        medicalInfo: data.medical_conditions || '',
        notes: data.additional_medical_notes || '',
        profileImage: data.profile_image || '',
        teamId: child.teamId,
        ageGroup: child.ageGroup,
        parentId: child.parentId,
        status: data.approval_status as 'pending' | 'approved' | 'rejected'
      };
    } catch (error) {
      logger.error('Error creating child:', error);
      throw error;
    }
  }

  async updateChild(id: string, updates: Partial<Child>): Promise<Child | undefined> {
    try {
      const updateData: any = {};
      
      if (updates.name) {
        const [firstName, ...lastNameParts] = updates.name.split(' ');
        updateData.first_name = firstName;
        updateData.last_name = lastNameParts.join(' ') || '';
      }
      
      if (updates.dateOfBirth) updateData.date_of_birth = updates.dateOfBirth;
      if (updates.medicalInfo) updateData.medical_conditions = updates.medicalInfo;
      if (updates.notes) updateData.additional_medical_notes = updates.notes;
      if (updates.profileImage) updateData.profile_image = updates.profileImage;
      if (updates.status) updateData.approval_status = updates.status;

      const { data, error } = await supabase
        .from('players')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      return {
        id: data.id,
        name: `${data.first_name} ${data.last_name}`,
        dateOfBirth: data.date_of_birth || '',
        medicalInfo: data.medical_conditions || '',
        notes: data.additional_medical_notes || '',
        profileImage: data.profile_image || '',
        teamId: updates.teamId || '',
        ageGroup: updates.ageGroup || '',
        parentId: updates.parentId || '',
        status: data.approval_status as 'pending' | 'approved' | 'rejected'
      };
    } catch (error) {
      logger.error('Error updating child:', error);
      return undefined;
    }
  }

  // Attendance
  async getAttendanceByEventId(eventId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('event_responses')
        .select('*')
        .eq('event_id', eventId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error('Error fetching attendance:', error);
      throw error;
    }
  }

  async createAttendance(attendance: any): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('event_responses')
        .insert(attendance)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error creating attendance:', error);
      throw error;
    }
  }
}

export const api = new UnifiedAPI();
export const teamApi = api; // Export alias for compatibility
