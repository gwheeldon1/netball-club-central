// Child/Player API operations
import { supabase } from '@/integrations/supabase/client';
import { offlineApi } from '../database';
import { logger } from '@/utils/logger';
import { BaseAPI } from './base';
import { Child } from '@/types/unified';

class ChildAPI extends BaseAPI {
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
        // Get player IDs from player_teams, then get player details
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
}

export const childApi = new ChildAPI();