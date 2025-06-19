
// Team members (players and staff) operations
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';
import { TeamPlayer, TeamStaff } from './types';

export class TeamMembersAPI {
  async getTeamPlayers(teamId: string): Promise<TeamPlayer[]> {
    try {
      console.log('🔍 Getting players for team:', teamId);
      
      // Get players assigned to the team
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
      
      console.log('📊 Player teams query result:', { data, error, teamId });
      
      if (error) {
        logger.error('Error fetching team players:', error);
        throw error;
      }
      
      const players = data?.map(pt => ({
        id: (pt.player as any).id,
        name: `${(pt.player as any).first_name} ${(pt.player as any).last_name}`,
        profileImage: (pt.player as any).profile_image,
        ageGroup: '', // We'll calculate this from date_of_birth if needed
        dateOfBirth: (pt.player as any).date_of_birth,
        teamId: teamId,
        parentId: '',
        status: 'approved' as const
      })) || [];
      
      console.log('👥 Processed players:', players);
      return players;
    } catch (error) {
      logger.warn('Failed to get team players:', error);
      return [];
    }
  }

  async getTeamStaff(teamId: string): Promise<{ coaches: TeamStaff[]; managers: TeamStaff[] }> {
    try {
      console.log('🔍 Getting staff for team:', teamId);
      
      // Get staff assigned to this specific team
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
      
      console.log('📊 Staff query result:', { data, error, teamId });
      
      if (error) {
        logger.error('Error fetching team staff:', error);
        console.error('Staff fetch error details:', error);
      }
      
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
      
      console.log('👨‍🏫 Processed staff:', { coaches, managers });
      return { coaches, managers };
    } catch (error) {
      logger.warn('Failed to get team staff:', error);
      return { coaches: [], managers: [] };
    }
  }

  async getTeamParents(teamId: string): Promise<TeamStaff[]> {
    try {
      console.log('🔍 Getting parents for team:', teamId);
      
      // Get parents whose children are in this team
      // First get all players in the team, then get their guardians
      const { data, error } = await supabase
        .from('player_teams')
        .select(`
          player_id
        `)
        .eq('team_id', teamId);
      
      console.log('📊 Player teams for parents query:', { data, error, teamId });
      
      if (error) {
        logger.error('Error fetching team players for parents:', error);
        return [];
      }

      if (!data || data.length === 0) {
        console.log('⚠️ No players found in team for parents lookup');
        return [];
      }

      const playerIds = data.map(pt => pt.player_id).filter(Boolean);
      console.log('👶 Player IDs to look up parents for:', playerIds);
      
      if (playerIds.length === 0) {
        console.log('⚠️ No valid player IDs found');
        return [];
      }

      // Now get guardians for these players
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
      
      console.log('📊 Guardians query result:', { guardiansData, guardiansError, playerIds });
      
      if (guardiansError) {
        logger.error('Error fetching guardians:', guardiansError);
        return [];
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
      
      console.log('👨‍👩‍👧‍👦 Processed parents:', parents);
      return parents;
    } catch (error) {
      logger.warn('Failed to get team parents:', error);
      console.error('Parents fetch error:', error);
      return [];
    }
  }
}
