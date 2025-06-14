// Unified offline-first API service - single source of truth for all data operations
import { supabase } from '@/integrations/supabase/client';
import { offlineApi } from './database';
import { logger } from '@/utils/logger';
import { User, Child, Team, Event, Attendance, UserRole } from '@/types';

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
          .single();
        
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
          .single();
        
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
          eventType: event.event_type as 'training' | 'match' | 'other',
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
          .single();
        
        if (error || !data) return undefined;
        
        return {
          id: data.id,
          name: data.title,
          date: data.event_date,
          time: '00:00',
          location: data.location || '',
          notes: data.description || '',
          eventType: data.event_type as 'training' | 'match' | 'other',
          teamId: data.team_id || ''
        } as Event;
      },
      () => offlineApi.getEventById(id),
      'getEventById'
    );
  }

  // Children (Players)
  async getChildren(): Promise<Child[]> {
    return this.withOfflineFallback(
      async () => {
        const { data, error } = await supabase
          .from('players')
          .select(`
            *,
            player_teams (
              team_id,
              teams (
                age_group
              )
            )
          `);
        
        if (error) throw error;
        
        return data?.map(player => {
          const teamAssignment = player.player_teams?.[0];
          return {
            id: player.id,
            name: `${player.first_name} ${player.last_name}`,
            dateOfBirth: player.date_of_birth || '',
            medicalInfo: player.medical_conditions || '',
            notes: player.additional_medical_notes || '',
            profileImage: player.profile_image || '',
            teamId: teamAssignment?.team_id || '',
            ageGroup: teamAssignment?.teams?.age_group || '',
            parentId: '', // Will need to be resolved from guardians relationship
            status: player.approval_status as 'pending' | 'approved' | 'rejected'
          };
        }) || [];
      },
      () => offlineApi.getChildren(),
      'getChildren'
    );
  }

  async getChildrenByTeamId(teamId: string): Promise<Child[]> {
    return this.withOfflineFallback(
      async () => {
        const { data, error } = await supabase
          .from('player_teams')
          .select(`
            players (
              *
            ),
            teams (
              age_group
            )
          `)
          .eq('team_id', teamId);
        
        if (error) throw error;
        
        return data?.map(pt => ({
          id: pt.players.id,
          name: `${pt.players.first_name} ${pt.players.last_name}`,
          dateOfBirth: pt.players.date_of_birth || '',
          medicalInfo: pt.players.medical_conditions || '',
          notes: pt.players.additional_medical_notes || '',
          profileImage: pt.players.profile_image || '',
          teamId: teamId,
          ageGroup: pt.teams?.age_group || '',
          parentId: '',
          status: pt.players.approval_status as 'pending' | 'approved' | 'rejected'
        })) || [];
      },
      () => offlineApi.getChildrenByTeamId(teamId),
      'getChildrenByTeamId'
    );
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