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
            description: updates.description,
            profile_image: updates.profileImage,
            banner_image: updates.bannerImage,
            icon: updates.icon,
            archived: updates.archived,
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
          description: data.description || '',
          profileImage: data.profile_image || '',
          bannerImage: data.banner_image || '',
          icon: data.icon || '',
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
}

export const teamApi = new TeamAPI();
