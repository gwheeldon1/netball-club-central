
// Core team CRUD operations
import { supabase } from '@/integrations/supabase/client';
import { offlineApi } from '../../database';
import { BaseAPI } from '../base';
import { Team } from '@/types/unified';
import { TeamData, TeamCreateData, TeamUpdateData } from './types';

export class TeamAPI extends BaseAPI {
  async getTeams(): Promise<Team[]> {
    return this.withOfflineFallback(
      async () => {
        const { data, error } = await supabase
          .from('teams')
          .select('*');
        
        if (error) throw error;
        
        return data?.map(team => this.mapTeamData(team)) || [];
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
        
        return this.mapTeamData(data);
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
        
        return this.mapTeamData(data);
      } catch (error) {
        console.warn('Create team failed online, saving offline:', error);
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
        
        return this.mapTeamData(data);
      } catch (error) {
        console.warn('Update team failed online, saving offline:', error);
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
        console.warn('Delete team failed online:', error);
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

  private mapTeamData(team: TeamData): Team {
    return {
      id: team.id,
      name: team.name,
      ageGroup: team.age_group,
      category: 'Junior' as Team['category'],
      description: (team as any).description || '',
      profileImage: (team as any).profile_image || '',
      bannerImage: (team as any).banner_image || '',
      icon: (team as any).icon || '',
      archived: team.archived || false
    };
  }
}

// Export class with both names for backward compatibility
export { TeamAPI as TeamOperations };
