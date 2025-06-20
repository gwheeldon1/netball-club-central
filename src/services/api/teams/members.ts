// Team members (players and staff) operations using unified team_members table
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';
import { TeamPlayer, TeamStaff, TeamMemberType } from './types';

export class TeamMembersAPI {
  async getTeamPlayers(teamId: string): Promise<TeamPlayer[]> {
    try {
      console.log('🔍 Getting players for team via team_members:', teamId);
      
      // Get players via the new team_members table
      const { data, error } = await supabase
        .from('team_members')
        .select(`
          player_id,
          player:players!team_members_player_id_fkey (
            id,
            first_name,
            last_name,
            profile_image,
            date_of_birth
          )
        `)
        .eq('team_id', teamId)
        .eq('member_type', 'parent')
        .eq('is_active', true);
      
      console.log('📊 Team members (parents) query result:', { data, error, teamId });
      
      if (error) {
        logger.error('Error fetching team players via team_members:', error);
        throw error;
      }
      
      // Process and deduplicate players (multiple parents can have same child)
      const playerMap = new Map<string, TeamPlayer>();
      
      data?.forEach(tm => {
        if (tm.player && tm.player_id) {
          const player = tm.player as any;
          if (!playerMap.has(player.id)) {
            playerMap.set(player.id, {
              id: player.id,
              name: `${player.first_name} ${player.last_name}`,
              profileImage: player.profile_image,
              ageGroup: '', // We'll calculate this from date_of_birth if needed
              dateOfBirth: player.date_of_birth,
              teamId: teamId,
              parentId: '',
              status: 'approved' as const
            });
          }
        }
      });
      
      const players = Array.from(playerMap.values());
      console.log('👥 Processed players via team_members:', players);
      return players;
    } catch (error) {
      logger.warn('Failed to get team players via team_members:', error);
      return [];
    }
  }

  async getTeamStaff(teamId: string): Promise<{ coaches: TeamStaff[]; managers: TeamStaff[] }> {
    try {
      console.log('🔍 Getting staff for team via team_members:', teamId);
      
      // Get staff via the new team_members table
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
        logger.error('Error fetching team staff via team_members:', error);
        console.error('Staff fetch error details:', error);
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
      
      console.log('👨‍🏫 Processed staff via team_members:', { coaches, managers });
      return { coaches, managers };
    } catch (error) {
      logger.warn('Failed to get team staff via team_members:', error);
      return { coaches: [], managers: [] };
    }
  }

  async getTeamParents(teamId: string): Promise<TeamStaff[]> {
    try {
      console.log('🔍 Getting parents for team via team_members:', teamId);
      
      // Get parents via the new team_members table
      const { data, error } = await supabase
        .from('team_members')
        .select(`
          member:guardians!team_members_member_id_fkey (
            id,
            first_name,
            last_name,
            email,
            profile_image
          )
        `)
        .eq('team_id', teamId)
        .eq('member_type', 'parent')
        .eq('is_active', true);
      
      console.log('📊 Team parents query result:', { data, error, teamId });
      
      if (error || !data || data.length === 0) {
        if (error) {
          logger.error('Error fetching team parents via team_members:', error);
          console.error('Parents fetch error details:', error);
        }
        
        // Fallback: try to get parents through player_teams and guardians
        console.log('🔄 Using fallback method for parents...');
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('player_teams')
          .select(`
            players!inner (
              id,
              guardians!guardians_player_id_fkey (
                id,
                first_name,
                last_name,
                email,
                profile_image
              )
            )
          `)
          .eq('team_id', teamId);
        
        console.log('📊 Fallback parents query result:', { fallbackData, fallbackError });
        
        if (fallbackError) {
          console.error('Fallback also failed:', fallbackError);
          return [];
        }
        
        // Process fallback data
        const parentMap = new Map<string, TeamStaff>();
        fallbackData?.forEach(pt => {
          const player = pt.players as any;
          if (player?.guardians) {
            const guardians = Array.isArray(player.guardians) ? player.guardians : [player.guardians];
            guardians.forEach((guardian: any) => {
              if (guardian && !parentMap.has(guardian.id)) {
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
        
        const fallbackParents = Array.from(parentMap.values());
        console.log('👨‍👩‍👧‍👦 Processed fallback parents:', fallbackParents);
        return fallbackParents;
      }
      
      // Deduplicate parents (same parent might have multiple children on team)
      const parentMap = new Map<string, TeamStaff>();
      
      data?.forEach(tm => {
        if (tm.member) {
          const member = tm.member as any;
          if (!parentMap.has(member.id)) {
            parentMap.set(member.id, {
              id: member.id,
              name: `${member.first_name} ${member.last_name}`,
              email: member.email || '',
              profileImage: member.profile_image,
              roles: ['parent']
            });
          }
        }
      });
      
      const parents = Array.from(parentMap.values());
      console.log('👨‍👩‍👧‍👦 Processed parents via team_members:', parents);
      return parents;
    } catch (error) {
      logger.warn('Failed to get team parents via team_members:', error);
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

  async addParentToTeam(teamId: string, parentId: string, playerId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('team_members')
        .insert({
          team_id: teamId,
          member_id: parentId,
          member_type: 'parent',
          player_id: playerId,
          is_active: true
        });

      if (error) throw error;
      
      logger.info('Added parent to team', { teamId, parentId, playerId });
    } catch (error) {
      logger.error('Error adding parent to team:', error);
      throw error;
    }
  }

  // Helper method to populate team_members table from existing data
  async syncParentMemberships(): Promise<void> {
    try {
      console.log('🔄 Syncing parent memberships to team_members table...');
      
      // Get all parent-player-team relationships from existing data
      const { data: relationships, error } = await supabase
        .from('player_teams')
        .select(`
          team_id,
          player_id,
          players!inner (
            id,
            guardians!guardians_player_id_fkey (
              id
            )
          )
        `);
      
      if (error) {
        console.error('Error fetching relationships:', error);
        return;
      }
      
      // Prepare inserts for team_members table
      const insertsToMake: Array<{
        team_id: string;
        member_id: string;
        member_type: 'parent';
        player_id: string;
        is_active: boolean;
      }> = [];
      
      relationships?.forEach(rel => {
        const player = rel.players as any;
        if (player?.guardians) {
          const guardians = Array.isArray(player.guardians) ? player.guardians : [player.guardians];
          guardians.forEach((guardian: any) => {
            if (guardian?.id) {
              insertsToMake.push({
                team_id: rel.team_id,
                member_id: guardian.id,
                member_type: 'parent',
                player_id: rel.player_id,
                is_active: true
              });
            }
          });
        }
      });
      
      if (insertsToMake.length > 0) {
        const { error: insertError } = await supabase
          .from('team_members')
          .upsert(insertsToMake, {
            onConflict: 'team_id,member_id,member_type,player_id'
          });
        
        if (insertError) {
          console.error('Error syncing parent memberships:', insertError);
        } else {
          console.log(`✅ Synced ${insertsToMake.length} parent memberships`);
        }
      }
    } catch (error) {
      console.error('Error in syncParentMemberships:', error);
    }
  }
}
