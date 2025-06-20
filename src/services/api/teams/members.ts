
// Team members (players and staff) operations using unified team_members table
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';
import { TeamPlayer, TeamStaff, TeamMemberType } from './types';

export class TeamMembersAPI {
  async getTeamPlayers(teamId: string): Promise<TeamPlayer[]> {
    try {
      console.log('🔍 Getting players for team:', teamId);
      
      // Get players via player_teams table
      const { data, error } = await supabase
        .from('player_teams')
        .select(`
          player_id,
          players!inner (
            id,
            first_name,
            last_name,
            profile_image,
            date_of_birth,
            approval_status
          )
        `)
        .eq('team_id', teamId);
      
      console.log('📊 Player teams query result:', { data, error, teamId });
      
      if (error) {
        logger.error('Error fetching team players:', error);
        throw error;
      }
      
      const players = data?.map(pt => {
        const player = pt.players as any;
        return {
          id: player.id,
          name: `${player.first_name} ${player.last_name}`,
          profileImage: player.profile_image,
          ageGroup: '', // We'll calculate this from date_of_birth if needed
          dateOfBirth: player.date_of_birth,
          teamId: teamId,
          parentId: '',
          status: player.approval_status as 'approved' | 'pending' | 'rejected'
        };
      }) || [];
      
      console.log('👥 Processed players:', players);
      return players;
    } catch (error) {
      logger.warn('Failed to get team players:', error);
      return [];
    }
  }

  async getTeamStaff(teamId: string): Promise<{ coaches: TeamStaff[]; managers: TeamStaff[] }> {
    try {
      console.log('🔍 Getting staff for team via team_members:', teamId);
      
      // Get staff via the team_members table
      const { data, error } = await supabase
        .from('team_members')
        .select(`
          member_type,
          member:guardians!team_members_member_id_fkey (
            id,
            first_name,
            last_name,
            email,
            profile_image
          )
        `)
        .eq('team_id', teamId)
        .eq('is_active', true)
        .in('member_type', ['coach', 'manager']);
      
      console.log('📊 Team staff query result:', { data, error, teamId });
      
      if (error) {
        logger.error('Error fetching team staff:', error);
      }
      
      const coaches: TeamStaff[] = [];
      const managers: TeamStaff[] = [];
      
      data?.forEach(tm => {
        if (tm.member) {
          const member = tm.member as any;
          const user: TeamStaff = {
            id: member.id,
            name: `${member.first_name} ${member.last_name}`,
            email: member.email || '',
            profileImage: member.profile_image,
            roles: [tm.member_type as string]
          };
          
          if (tm.member_type === 'coach') {
            coaches.push(user);
          } else if (tm.member_type === 'manager') {
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
      
      // Get parents through player_teams -> players -> guardians relationship
      const { data, error } = await supabase
        .from('player_teams')
        .select(`
          players!inner (
            id,
            guardians!guardians_player_id_fkey (
              id,
              first_name,
              last_name,
              email,
              profile_image,
              approval_status
            )
          )
        `)
        .eq('team_id', teamId);
      
      console.log('📊 Team parents query result:', { data, error, teamId });
      
      if (error) {
        logger.error('Error fetching team parents:', error);
        return [];
      }
      
      // Deduplicate parents (same parent might have multiple children on team)
      const parentMap = new Map<string, TeamStaff>();
      
      data?.forEach(pt => {
        const player = pt.players as any;
        if (player?.guardians) {
          const guardians = Array.isArray(player.guardians) ? player.guardians : [player.guardians];
          guardians.forEach((guardian: any) => {
            if (guardian && guardian.approval_status === 'approved' && !parentMap.has(guardian.id)) {
              parentMap.set(guardian.id, {
                id: guardian.id,
                name: `${guardian.first_name} ${guardian.last_name}`,
                email: guardian.email || '',
                profileImage: guardian.profile_image,
                roles: ['parent']
              });
            }
          });
        }
      });
      
      const parents = Array.from(parentMap.values());
      console.log('👨‍👩‍👧‍👦 Processed parents:', parents);
      return parents;
    } catch (error) {
      logger.warn('Failed to get team parents:', error);
      console.error('Parents fetch error:', error);
      return [];
    }
  }

  // New methods for managing team membership
  async addTeamMember(teamId: string, memberId: string, memberType: 'coach' | 'manager' | 'admin', assignedBy?: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('team_members')
        .insert({
          team_id: teamId,
          member_id: memberId,
          member_type: memberType,
          assigned_by: assignedBy,
          is_active: true
        });

      if (error) throw error;
      
      logger.info(`Added ${memberType} to team`, { teamId, memberId });
    } catch (error) {
      logger.error('Error adding team member:', error);
      throw error;
    }
  }

  async removeTeamMember(teamId: string, memberId: string, memberType: TeamMemberType): Promise<void> {
    try {
      const { error } = await supabase
        .from('team_members')
        .update({ is_active: false })
        .eq('team_id', teamId)
        .eq('member_id', memberId)
        .eq('member_type', memberType);

      if (error) throw error;
      
      logger.info(`Removed ${memberType} from team`, { teamId, memberId });
    } catch (error) {
      logger.error('Error removing team member:', error);
      throw error;
    }
  }
}
