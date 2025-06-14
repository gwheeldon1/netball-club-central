// Unified offline-first API service - single source of truth for all data operations
import { supabase } from '@/integrations/supabase/client';
import { offlineApi } from './database';
import { logger } from '@/utils/logger';
import { User, Child, Team, Event, Attendance, UserRole } from '@/types/unified';

class UnifiedAPI {
  private isOnline = navigator.onLine;

  constructor() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncPendingChanges();
    });
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  // Health check
  async isConnected(): Promise<boolean> {
    if (!this.isOnline) return false;
    
    try {
      const { error } = await supabase.from('teams').select('id').limit(1);
      return !error;
    } catch {
      return false;
    }
  }

  // Sync pending changes when coming back online
  private async syncPendingChanges(): Promise<void> {
    try {
      const pendingItems = await offlineApi.getPendingSyncItems();
      for (const item of pendingItems) {
        // Implement sync logic based on table and action
        // This is a simplified version - in production you'd want more robust conflict resolution
        await this.syncItem(item);
      }
    } catch (error) {
      logger.error('Sync failed:', error);
    }
  }

  private async syncItem(item: any): Promise<void> {
    // Placeholder for sync logic - implement based on your needs
    logger.info('Syncing item:', item);
  }

  // Generic method for trying online first, falling back to offline
  private async withOfflineFallback<T>(
    onlineOperation: () => Promise<T>,
    offlineOperation: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    if (this.isOnline) {
      try {
        const result = await onlineOperation();
        return result;
      } catch (error) {
        logger.warn(`${operationName} failed online, trying offline:`, error);
        return await offlineOperation();
      }
    } else {
      return await offlineOperation();
    }
  }

  // Users
  async getUsers(): Promise<User[]> {
    return this.withOfflineFallback(
      async () => {
        const { data, error } = await supabase
          .from('guardians')
          .select(`
            *,
            user_roles (
              role,
              is_active
            )
          `);
        
        if (error) throw error;
        
        return data?.map(guardian => ({
          id: guardian.id,
          name: `${guardian.first_name} ${guardian.last_name}`,
          email: guardian.email || '',
          phone: guardian.phone || '',
          profileImage: guardian.profile_image || '',
          roles: guardian.user_roles?.filter(ur => ur.is_active).map(ur => ur.role as UserRole) || ['parent' as UserRole]
        })) || [];
      },
      async () => {
        const dbUsers = await offlineApi.getUsers();
        return dbUsers.map(dbUser => ({
          ...dbUser,
          roles: dbUser.roles as UserRole[]
        }));
      },
      'getUsers'
    );
  }

  async getUserById(id: string): Promise<User | undefined> {
    return this.withOfflineFallback(
      async () => {
        const { data, error } = await supabase
          .from('guardians')
          .select(`
            *,
            user_roles (
              role,
              is_active
            )
          `)
          .eq('id', id)
          .maybeSingle();
        
        if (error || !data) return undefined;
        
        return {
          id: data.id,
          name: `${data.first_name} ${data.last_name}`,
          email: data.email || '',
          phone: data.phone || '',
          profileImage: data.profile_image || '',
          roles: data.user_roles?.filter(ur => ur.is_active).map(ur => ur.role as UserRole) || ['parent' as UserRole]
        };
      },
      async () => {
        const dbUser = await offlineApi.getUserById(id);
        if (!dbUser) return undefined;
        return {
          ...dbUser,
          roles: dbUser.roles as UserRole[]
        };
      },
      'getUserById'
    );
  }

  async createUser(user: Omit<User, 'id'>): Promise<User> {
    const [firstName, ...lastNameParts] = user.name.split(' ');
    
    if (this.isOnline) {
      try {
        const { data, error } = await supabase
          .from('guardians')
          .insert({
            first_name: firstName,
            last_name: lastNameParts.join(' '),
            email: user.email,
            phone: user.phone,
            approval_status: 'pending'
          })
          .select()
          .single();
        
        if (error) throw error;
        
        // Assign default role
        await supabase
          .from('user_roles')
          .insert({
            guardian_id: data.id,
            role: 'parent'
          });
        
        return {
          id: data.id,
          name: `${data.first_name} ${data.last_name}`,
          email: data.email || '',
          phone: data.phone || '',
          profileImage: data.profile_image || '',
          roles: ['parent']
        };
      } catch (error) {
        logger.warn('Create user failed online, saving offline:', error);
      }
    }
    
    // Fallback to offline storage
    const dbUser = await offlineApi.createUser(user);
    return {
      ...dbUser,
      roles: dbUser.roles as UserRole[]
    };
  }

  // Teams
  async getTeams(): Promise<Team[]> {
    return this.withOfflineFallback(
      async () => {
        const { data, error } = await supabase
          .from('teams')
          .select('*');
        
        if (error) throw error;
        
        return data?.map(team => ({
          id: team.id,
          name: team.name,
          ageGroup: team.age_group,
          category: 'Junior' as Team['category'],
          description: '',
          profileImage: '',
          bannerImage: '',
          icon: ''
        } as Team)) || [];
      },
      () => offlineApi.getTeams(),
      'getTeams'
    );
  }

  async getTeamById(id: string): Promise<Team | undefined> {
    return this.withOfflineFallback(
      async () => {
        const { data, error } = await supabase
          .from('teams')
          .select('*')
          .eq('id', id)
          .maybeSingle();
        
        if (error || !data) return undefined;
        
        return {
          id: data.id,
          name: data.name,
          ageGroup: data.age_group,
          category: 'Junior' as Team['category'],
          description: '',
          profileImage: '',
          bannerImage: '',
          icon: ''
        } as Team;
      },
      () => offlineApi.getTeamById(id),
      'getTeamById'
    );
  }

  async createTeam(team: Omit<Team, 'id'>): Promise<Team> {
    if (this.isOnline) {
      try {
        const { data, error } = await supabase
          .from('teams')
          .insert({
            name: team.name,
            age_group: team.ageGroup,
            season_year: new Date().getFullYear()
          })
          .select()
          .single();
        
        if (error) throw error;
        
        return {
          id: data.id,
          name: data.name,
          ageGroup: data.age_group,
          category: 'Junior' as Team['category'],
          description: '',
          profileImage: '',
          bannerImage: '',
          icon: ''
        };
      } catch (error) {
        logger.warn('Create team failed online, saving offline:', error);
      }
    }
    
    return offlineApi.createTeam(team);
  }

  async updateTeam(id: string, updates: Partial<Omit<Team, 'id'>>): Promise<Team | undefined> {
    if (this.isOnline) {
      try {
        const { data, error } = await supabase
          .from('teams')
          .update({
            name: updates.name,
            age_group: updates.ageGroup,
          })
          .eq('id', id)
          .select()
          .single();
        
        if (error) throw error;
        
        return {
          id: data.id,
          name: data.name,
          ageGroup: data.age_group,
          category: 'Junior' as Team['category'],
          description: '',
          profileImage: '',
          bannerImage: '',
          icon: ''
        };
      } catch (error) {
        logger.warn('Update team failed online, saving offline:', error);
      }
    }
    
    return offlineApi.updateTeam(id, updates);
  }

  async deleteTeam(id: string): Promise<boolean> {
    if (this.isOnline) {
      try {
        // Check if team has players first
        const { data: players } = await supabase
          .from('player_teams')
          .select('player_id')
          .eq('team_id', id);
        
        if (players && players.length > 0) {
          throw new Error(`Cannot delete team. ${players.length} players are assigned to this team.`);
        }
        
        const { error } = await supabase
          .from('teams')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        
        return true;
      } catch (error) {
        logger.warn('Delete team failed online:', error);
        throw error;
      }
    }
    
    // Offline fallback - always return true since offline delete doesn't throw
    try {
      await offlineApi.deleteTeam(id);
      return true;
    } catch {
      return false;
    }
  }

  // Events
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
    
    // Offline fallback - always return true since offline delete doesn't throw
    try {
      await offlineApi.deleteEvent(id);
      return true;
    } catch {
      return false;
    }
  }

  // Children (Players)
  async getChildren(): Promise<Child[]> {
    return this.withOfflineFallback(
      async () => {
        const { data, error } = await supabase
          .from('players')
          .select(`
            id,
            first_name,
            last_name,
            date_of_birth,
            medical_conditions,
            additional_medical_notes,
            profile_image,
            approval_status
          `);
        
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
      },
      () => offlineApi.getChildren(),
      'getChildren'
    );
  }

  async getChildrenByTeamId(teamId: string): Promise<Child[]> {
    return this.withOfflineFallback(
      async () => {
        // Simple approach: get player IDs from player_teams, then get player details
        const { data: playerTeams, error: ptError } = await supabase
          .from('player_teams')
          .select('player_id')
          .eq('team_id', teamId);
        
        if (ptError) throw ptError;
        
        if (!playerTeams || playerTeams.length === 0) {
          return [];
        }
        
        const playerIds = playerTeams.map(pt => pt.player_id);
        
        const { data: players, error: playersError } = await supabase
          .from('players')
          .select(`
            id,
            first_name,
            last_name,
            date_of_birth,
            medical_conditions,
            additional_medical_notes,
            profile_image,
            approval_status
          `)
          .in('id', playerIds);
        
        if (playersError) throw playersError;
        
        return (players || []).map(player => ({
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
        }));
      },
      () => offlineApi.getChildrenByTeamId(teamId),
      'getChildrenByTeamId'
    );
  }

  async createChild(child: Omit<Child, 'id'>): Promise<Child> {
    if (this.isOnline) {
      try {
        const [firstName, ...lastNameParts] = child.name.split(' ');
        
        const { data, error } = await supabase
          .from('players')
          .insert({
            first_name: firstName,
            last_name: lastNameParts.join(' '),
            date_of_birth: child.dateOfBirth,
            medical_conditions: child.medicalInfo,
            additional_medical_notes: child.notes,
            profile_image: child.profileImage,
            approval_status: 'pending'
          })
          .select()
          .single();
        
        if (error) throw error;
        
        // If teamId is provided, create team assignment
        if (child.teamId) {
          await supabase
            .from('player_teams')
            .insert({
              player_id: data.id,
              team_id: child.teamId
            });
        }
        
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
        logger.warn('Create child failed online, saving offline:', error);
      }
    }
    
    return offlineApi.createChild(child);
  }

  async updateChild(id: string, updates: Partial<Omit<Child, 'id'>>): Promise<Child | undefined> {
    if (this.isOnline) {
      try {
        const updateData: any = {};
        
        if (updates.name) {
          const [firstName, ...lastNameParts] = updates.name.split(' ');
          updateData.first_name = firstName;
          updateData.last_name = lastNameParts.join(' ');
        }
        if (updates.dateOfBirth) updateData.date_of_birth = updates.dateOfBirth;
        if (updates.medicalInfo !== undefined) updateData.medical_conditions = updates.medicalInfo;
        if (updates.notes !== undefined) updateData.additional_medical_notes = updates.notes;
        if (updates.profileImage !== undefined) updateData.profile_image = updates.profileImage;
        if (updates.status) updateData.approval_status = updates.status;
        
        const { data, error } = await supabase
          .from('players')
          .update(updateData)
          .eq('id', id)
          .select()
          .single();
        
        if (error) throw error;
        
        // Handle team assignment updates
        if (updates.teamId !== undefined) {
          // Remove existing team assignments
          await supabase
            .from('player_teams')
            .delete()
            .eq('player_id', id);
          
          // Add new team assignment if provided
          if (updates.teamId) {
            await supabase
              .from('player_teams')
              .insert({
                player_id: id,
                team_id: updates.teamId
              });
          }
        }
        
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
        logger.warn('Update child failed online, saving offline:', error);
      }
    }
    
    return offlineApi.updateChild(id, updates);
  }

  // Attendance
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
    
    // Fallback to offline storage with a placeholder implementation
    return attendance;
  }

  // Utility methods
  getOnlineStatus(): boolean {
    return this.isOnline;
  }

  async getSyncStatus(): Promise<boolean> {
    const pendingItems = await offlineApi.getPendingSyncItems();
    return pendingItems.length === 0;
  }

  async forceSync(): Promise<void> {
    if (this.isOnline) {
      await this.syncPendingChanges();
    }
  }
}

export const api = new UnifiedAPI();