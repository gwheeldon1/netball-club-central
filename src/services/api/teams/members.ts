
// Team members (players and staff) operations
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';
import { TeamPlayer, TeamStaff } from './types';

export class TeamMembersAPI {
  async getTeamPlayers(teamId: string): Promise<TeamPlayer[]> {
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

  async getTeamStaff(teamId: string): Promise<{ coaches: TeamStaff[]; managers: TeamStaff[] }> {
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
      
      const coaches: TeamStaff[] = [];
      const managers: TeamStaff[] = [];
      
      data?.forEach(ur => {
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
      });
      
      return { coaches, managers };
    } catch (error) {
      logger.warn('Failed to get team staff:', error);
      return { coaches: [], managers: [] };
    }
  }
}
