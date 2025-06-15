
// Team API operations
import { supabase } from '@/integrations/supabase/client';
import { offlineApi } from '../database';
import { logger } from '@/utils/logger';
import { BaseAPI } from './base';
import { Team } from '@/types/unified';

class TeamAPI extends BaseAPI {
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
          description: team.description || '',
          profileImage: team.profile_image || '',
          bannerImage: team.banner_image || '',
          icon: team.icon || '',
          archived: team.archived || false
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
          description: data.description || '',
          profileImage: data.profile_image || '',
          bannerImage: data.banner_image || '',
          icon: data.icon || '',
          archived: data.archived || false
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
            season_year: new Date().getFullYear(),
            description: team.description,
            profile_image: team.profileImage,
            banner_image: team.bannerImage,
            icon: team.icon,
            archived: team.archived || false
          })
          .select()
          .single();
        
        if (error) throw error;
        
        return {
          id: data.id,
          name: data.name,
          ageGroup: data.age_group,
          category: 'Junior' as Team['category'],
          description: (data as any).description || '',
          profileImage: (data as any).profile_image || '',
          bannerImage: (data as any).banner_image || '',
          icon: (data as any).icon || '',
          archived: data.archived || false
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
        const updateData: any = {};
        
        if (updates.name) updateData.name = updates.name;
        if (updates.ageGroup) updateData.age_group = updates.ageGroup;
        if (updates.description !== undefined) updateData.description = updates.description;
        if (updates.profileImage !== undefined) updateData.profile_image = updates.profileImage;
        if (updates.bannerImage !== undefined) updateData.banner_image = updates.bannerImage;
        if (updates.icon !== undefined) updateData.icon = updates.icon;
        if (updates.archived !== undefined) updateData.archived = updates.archived;
        
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
          category: 'Junior' as Team['category'],
          description: (data as any).description || '',
          profileImage: (data as any).profile_image || '',
          bannerImage: (data as any).banner_image || '',
          icon: (data as any).icon || '',
          archived: data.archived || false
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
    
    // Offline fallback
    try {
      await offlineApi.deleteTeam(id);
      return true;
    } catch {
      return false;
    }
  }

  async getTeamPlayers(teamId: string) {
    try {
      const { data, error } = await supabase
        .from('player_teams')
        .select(`
          player:players (
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
        ageGroup: '', // We'll calculate this from date_of_birth if needed
        dateOfBirth: (pt.player as any).date_of_birth,
        teamId: teamId,
        parentId: '',
        status: 'approved' as const
      })) || [];
    } catch (error) {
      logger.warn('Failed to get team players:', error);
      return [];
    }
  }

  async getTeamStaff(teamId: string) {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select(`
          role,
          guardian:guardians (
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
      
      const coaches = [];
      const managers = [];
      
      data?.forEach(ur => {
        const user = {
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
      });
      
      return { coaches, managers };
    } catch (error) {
      logger.warn('Failed to get team staff:', error);
      return { coaches: [], managers: [] };
    }
  }
}

export const teamApi = new TeamAPI();
