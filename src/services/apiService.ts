
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';
import type {
  DatabaseTeam,
  DatabaseEvent,
  DatabasePlayer,
  DatabaseGuardian,
  DatabaseEventResponse,
  Team,
  Event,
  Child,
  User,
  Attendance,
  TeamPlayer,
  TeamStaff
} from '@/types/core';

class APIService {
  // ========== TEAMS ==========
  async getTeams(): Promise<Team[]> {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('archived', false)
        .order('name');

      if (error) throw error;
      
      return data?.map(this.mapDatabaseTeamToTeam) || [];
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
      
      return this.mapDatabaseTeamToTeam(data);
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
          archived: team.archived || false
        })
        .select()
        .single();

      if (error) throw error;
      
      return this.mapDatabaseTeamToTeam(data);
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
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.archived !== undefined) updateData.archived = updates.archived;

      const { data, error } = await supabase
        .from('teams')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      return this.mapDatabaseTeamToTeam(data);
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

  // Team member operations
  async getTeamPlayers(teamId: string): Promise<TeamPlayer[]> {
    try {
      const { data, error } = await supabase
        .from('player_teams')
        .select(`
          player:players!player_teams_player_id_fkey (
            id,
            first_name,
            last_name,
            profile_image,
            date_of_birth
          )
        `)
        .eq('team_id', teamId);
      
      if (error) throw error;
      
      return data?.map(pt => ({
        id: (pt.player as any).id,
        name: `${(pt.player as any).first_name} ${(pt.player as any).last_name}`,
        profileImage: (pt.player as any).profile_image,
        ageGroup: '',
        dateOfBirth: (pt.player as any).date_of_birth,
        teamId: teamId,
        parentId: '',
        status: 'approved' as const
      })) || [];
    } catch (error) {
      logger.error('Error fetching team players:', error);
      return [];
    }
  }

  async getTeamStaff(teamId: string): Promise<{ coaches: TeamStaff[]; managers: TeamStaff[] }> {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select(`
          role,
          guardian:guardians!user_roles_guardian_id_fkey (
            id,
            first_name,
            last_name,
            email,
            profile_image
          )
        `)
        .eq('team_id', teamId)
        .eq('is_active', true)
        .in('role', ['coach', 'manager']);
      
      if (error) throw error;
      
      const coaches: TeamStaff[] = [];
      const managers: TeamStaff[] = [];
      
      data?.forEach(ur => {
        if (ur.guardian) {
          const user: TeamStaff = {
            id: (ur.guardian as any).id,
            name: `${(ur.guardian as any).first_name} ${(ur.guardian as any).last_name}`,
            email: (ur.guardian as any).email,
            profileImage: (ur.guardian as any).profile_image,
            roles: [ur.role]
          };
          
          if (ur.role === 'coach') {
            coaches.push(user);
          } else if (ur.role === 'manager') {
            managers.push(user);
          }
        }
      });
      
      return { coaches, managers };
    } catch (error) {
      logger.error('Error fetching team staff:', error);
      return { coaches: [], managers: [] };
    }
  }

  async getTeamParents(teamId: string): Promise<TeamStaff[]> {
    try {
      const { data, error } = await supabase
        .from('player_teams')
        .select('player_id')
        .eq('team_id', teamId);
      
      if (error) throw error;

      if (!data || data.length === 0) {
        return [];
      }

      const playerIds = data.map(pt => pt.player_id).filter(Boolean);
      
      if (playerIds.length === 0) {
        return [];
      }

      const { data: guardiansData, error: guardiansError } = await supabase
        .from('guardians')
        .select(`
          id,
          first_name,
          last_name,
          email,
          profile_image,
          player_id
        `)
        .in('player_id', playerIds)
        .eq('approval_status', 'approved');
      
      if (guardiansError) throw guardiansError;
      
      const parents: TeamStaff[] = [];
      const seenParentIds = new Set<string>();
      
      guardiansData?.forEach(guardian => {
        if (!seenParentIds.has(guardian.id)) {
          seenParentIds.add(guardian.id);
          parents.push({
            id: guardian.id,
            name: `${guardian.first_name} ${guardian.last_name}`,
            email: guardian.email || '',
            profileImage: guardian.profile_image,
            roles: ['parent']
          });
        }
      });
      
      return parents;
    } catch (error) {
      logger.error('Error fetching team parents:', error);
      return [];
    }
  }

  // ========== EVENTS ==========
  async getEvents(): Promise<Event[]> {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('event_date');

      if (error) throw error;
      
      return data?.map(this.mapDatabaseEventToEvent) || [];
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
      
      return this.mapDatabaseEventToEvent(data);
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
      
      return this.mapDatabaseEventToEvent(data);
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
      
      return this.mapDatabaseEventToEvent(data);
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

  // ========== CHILDREN ==========
  async getChildren(): Promise<Child[]> {
    try {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .order('first_name');

      if (error) throw error;
      
      return data?.map(this.mapDatabasePlayerToChild) || [];
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
        ...this.mapDatabasePlayerToChild(player),
        teamId: teamId
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
          approval_status: child.status,
          terms_accepted: true,
          code_of_conduct_accepted: true,
          photo_consent: true,
          data_processing_consent: true
        })
        .select()
        .single();

      if (error) throw error;
      
      return this.mapDatabasePlayerToChild(data);
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
      
      return this.mapDatabasePlayerToChild(data);
    } catch (error) {
      logger.error('Error updating child:', error);
      return undefined;
    }
  }

  // ========== ATTENDANCE ==========
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

  // ========== MAPPING FUNCTIONS ==========
  private mapDatabaseTeamToTeam(dbTeam: DatabaseTeam): Team {
    return {
      id: dbTeam.id,
      name: dbTeam.name,
      ageGroup: dbTeam.age_group,
      category: 'Junior' as Team['category'],
      description: dbTeam.description || '',
      archived: dbTeam.archived
    };
  }

  private mapDatabaseEventToEvent(dbEvent: DatabaseEvent): Event {
    const eventDate = new Date(dbEvent.event_date);
    return {
      id: dbEvent.id,
      name: dbEvent.title,
      date: dbEvent.event_date?.split('T')[0] || '',
      time: eventDate.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
      location: dbEvent.location || '',
      notes: dbEvent.description || '',
      description: dbEvent.description || '',
      eventType: dbEvent.event_type as Event['eventType'],
      teamId: dbEvent.team_id || '',
      isHome: dbEvent.is_home || false,
      requiresRSVP: true
    };
  }

  private mapDatabasePlayerToChild(dbPlayer: DatabasePlayer): Child {
    return {
      id: dbPlayer.id,
      name: `${dbPlayer.first_name} ${dbPlayer.last_name}`,
      dateOfBirth: dbPlayer.date_of_birth || '',
      medicalInfo: dbPlayer.medical_conditions || '',
      notes: dbPlayer.additional_medical_notes || '',
      profileImage: dbPlayer.profile_image || '',
      teamId: '',
      ageGroup: '',
      parentId: '',
      status: dbPlayer.approval_status as Child['status']
    };
  }
}

export const api = new APIService();
