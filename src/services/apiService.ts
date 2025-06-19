
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

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  success: boolean;
}

class APIService {
  // Health check
  async isConnected(): Promise<boolean> {
    try {
      const { error } = await supabase.from('teams').select('id').limit(1);
      return !error;
    } catch {
      return false;
    }
  }

  // Generic error handler
  private handleError(operation: string, error: any): never {
    logger.error(`${operation} failed:`, error);
    throw new Error(error?.message || `Failed to ${operation}`);
  }

  // ========== TEAMS ==========
  async getTeams(): Promise<Team[]> {
    try {
      logger.info('Fetching teams from Supabase...');
      
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('archived', false)
        .order('name');

      if (error) {
        this.handleError('fetch teams', error);
      }

      const teams = data?.map(this.mapDatabaseTeamToTeam) || [];
      logger.info(`Successfully fetched ${teams.length} teams`);
      
      return teams;
    } catch (error) {
      this.handleError('fetch teams', error);
    }
  }

  async getTeamById(id: string): Promise<Team | null> {
    try {
      logger.info(`Fetching team with ID: ${id}`);
      
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          logger.warn(`Team not found: ${id}`);
          return null;
        }
        this.handleError('fetch team', error);
      }
      
      const team = this.mapDatabaseTeamToTeam(data);
      logger.info(`Successfully fetched team: ${team.name}`);
      
      return team;
    } catch (error) {
      this.handleError('fetch team', error);
    }
  }

  async createTeam(team: Omit<Team, 'id'>): Promise<Team> {
    try {
      logger.info(`Creating team: ${team.name}`);
      
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

      if (error) {
        this.handleError('create team', error);
      }
      
      const newTeam = this.mapDatabaseTeamToTeam(data);
      logger.info(`Successfully created team: ${newTeam.name}`);
      
      return newTeam;
    } catch (error) {
      this.handleError('create team', error);
    }
  }

  async updateTeam(id: string, updates: Partial<Team>): Promise<Team> {
    try {
      logger.info(`Updating team: ${id}`);
      
      const updateData: any = {};
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.ageGroup !== undefined) updateData.age_group = updates.ageGroup;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.archived !== undefined) updateData.archived = updates.archived;

      const { data, error } = await supabase
        .from('teams')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        this.handleError('update team', error);
      }
      
      const updatedTeam = this.mapDatabaseTeamToTeam(data);
      logger.info(`Successfully updated team: ${updatedTeam.name}`);
      
      return updatedTeam;
    } catch (error) {
      this.handleError('update team', error);
    }
  }

  async deleteTeam(id: string): Promise<boolean> {
    try {
      logger.info(`Deleting team: ${id}`);
      
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', id);

      if (error) {
        this.handleError('delete team', error);
      }
      
      logger.info(`Successfully deleted team: ${id}`);
      return true;
    } catch (error) {
      this.handleError('delete team', error);
    }
  }

  // Team member operations
  async getTeamPlayers(teamId: string): Promise<TeamPlayer[]> {
    try {
      logger.info(`Fetching players for team: ${teamId}`);
      
      const { data, error } = await supabase
        .from('player_teams')
        .select(`
          player:players!player_teams_player_id_fkey (
            id,
            first_name,
            last_name,
            profile_image,
            date_of_birth,
            approval_status
          )
        `)
        .eq('team_id', teamId);
      
      if (error) {
        this.handleError('fetch team players', error);
      }
      
      const players = data?.map(pt => {
        const player = pt.player as any;
        return {
          id: player.id,
          name: `${player.first_name} ${player.last_name}`,
          profileImage: player.profile_image,
          ageGroup: '', // Calculate from date_of_birth if needed
          dateOfBirth: player.date_of_birth,
          teamId: teamId,
          parentId: '', // Would need to join with guardians table
          status: player.approval_status as 'pending' | 'approved' | 'rejected'
        };
      }) || [];
      
      logger.info(`Successfully fetched ${players.length} players for team: ${teamId}`);
      return players;
    } catch (error) {
      this.handleError('fetch team players', error);
    }
  }

  async getTeamStaff(teamId: string): Promise<{ coaches: TeamStaff[]; managers: TeamStaff[] }> {
    try {
      logger.info(`Fetching staff for team: ${teamId}`);
      
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
      
      if (error) {
        this.handleError('fetch team staff', error);
      }
      
      const coaches: TeamStaff[] = [];
      const managers: TeamStaff[] = [];
      
      data?.forEach(ur => {
        if (ur.guardian) {
          const guardian = ur.guardian as any;
          const user: TeamStaff = {
            id: guardian.id,
            name: `${guardian.first_name} ${guardian.last_name}`,
            email: guardian.email || '',
            profileImage: guardian.profile_image,
            roles: [ur.role]
          };
          
          if (ur.role === 'coach') {
            coaches.push(user);
          } else if (ur.role === 'manager') {
            managers.push(user);
          }
        }
      });
      
      logger.info(`Successfully fetched staff for team: ${teamId} (${coaches.length} coaches, ${managers.length} managers)`);
      return { coaches, managers };
    } catch (error) {
      this.handleError('fetch team staff', error);
    }
  }

  async getTeamParents(teamId: string): Promise<TeamStaff[]> {
    try {
      logger.info(`Fetching parents for team: ${teamId}`);
      
      // First get all players in the team
      const { data: playerTeams, error: playerTeamsError } = await supabase
        .from('player_teams')
        .select('player_id')
        .eq('team_id', teamId);
      
      if (playerTeamsError) {
        this.handleError('fetch team players for parents', playerTeamsError);
      }

      if (!playerTeams || playerTeams.length === 0) {
        return [];
      }

      const playerIds = playerTeams.map(pt => pt.player_id).filter(Boolean);
      
      if (playerIds.length === 0) {
        return [];
      }

      // Then get guardians for those players
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
      
      if (guardiansError) {
        this.handleError('fetch team parents', guardiansError);
      }
      
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
      
      logger.info(`Successfully fetched ${parents.length} parents for team: ${teamId}`);
      return parents;
    } catch (error) {
      this.handleError('fetch team parents', error);
    }
  }

  // ========== EVENTS ==========
  async getEvents(): Promise<Event[]> {
    try {
      logger.info('Fetching events from Supabase...');
      
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('event_date');

      if (error) {
        this.handleError('fetch events', error);
      }
      
      const events = data?.map(this.mapDatabaseEventToEvent) || [];
      logger.info(`Successfully fetched ${events.length} events`);
      
      return events;
    } catch (error) {
      this.handleError('fetch events', error);
    }
  }

  // ========== CHILDREN ==========
  async getChildren(): Promise<Child[]> {
    try {
      logger.info('Fetching children from Supabase...');
      
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .order('first_name');

      if (error) {
        this.handleError('fetch children', error);
      }
      
      const children = data?.map(this.mapDatabasePlayerToChild) || [];
      logger.info(`Successfully fetched ${children.length} children`);
      
      return children;
    } catch (error) {
      this.handleError('fetch children', error);
    }
  }

  // ========== MAPPING FUNCTIONS ==========
  private mapDatabaseTeamToTeam(dbTeam: DatabaseTeam): Team {
    return {
      id: dbTeam.id,
      name: dbTeam.name,
      ageGroup: dbTeam.age_group,
      category: this.mapAgeGroupToCategory(dbTeam.age_group),
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

  private mapAgeGroupToCategory(ageGroup: string): Team['category'] {
    const age = parseInt(ageGroup.replace(/\D/g, ''));
    if (age <= 16) return 'Junior';
    if (age >= 18) return 'Senior';
    return 'Mixed';
  }

  // Placeholder implementations for missing methods
  async getEventById(id: string): Promise<Event | undefined> {
    // TODO: Implement
    return undefined;
  }

  async createEvent(event: Omit<Event, 'id'>): Promise<Event> {
    // TODO: Implement
    throw new Error('Not implemented');
  }

  async updateEvent(id: string, updates: Partial<Omit<Event, 'id'>>): Promise<Event | undefined> {
    // TODO: Implement
    return undefined;
  }

  async deleteEvent(id: string): Promise<boolean> {
    // TODO: Implement
    return false;
  }

  async getChildrenByTeamId(teamId: string): Promise<Child[]> {
    // TODO: Implement
    return [];
  }

  async createChild(child: Omit<Child, 'id'>): Promise<Child> {
    // TODO: Implement
    throw new Error('Not implemented');
  }

  async updateChild(id: string, updates: Partial<Child>): Promise<Child | undefined> {
    // TODO: Implement
    return undefined;
  }

  async getAttendanceByEventId(eventId: string): Promise<any[]> {
    // TODO: Implement
    return [];
  }

  async createAttendance(attendance: any): Promise<any> {
    // TODO: Implement
    throw new Error('Not implemented');
  }
}

export const api = new APIService();
