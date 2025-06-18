
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

export interface Group {
  id: string;
  name: string;
  description?: string;
  avatar_image?: string;
  created_at: string;
  updated_at: string;
}

export interface GroupStaff {
  id: string;
  group_id: string;
  guardian_id: string;
  role: string;
  assigned_at: string;
}

export interface GroupWithTeams extends Group {
  teams: Array<{
    id: string;
    name: string;
    age_group: string;
  }>;
  staff: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
  }>;
}

export class GroupOperations {
  async getGroups(): Promise<Group[]> {
    try {
      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .order('name');
      
      if (error) {
        logger.error('Error fetching groups:', error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      logger.warn('Failed to get groups:', error);
      return [];
    }
  }

  async getGroupById(id: string): Promise<GroupWithTeams | null> {
    try {
      const { data: group, error: groupError } = await supabase
        .from('groups')
        .select('*')
        .eq('id', id)
        .single();
      
      if (groupError) {
        logger.error('Error fetching group:', groupError);
        throw groupError;
      }

      // Get teams for this group
      const { data: teams, error: teamsError } = await supabase
        .from('teams')
        .select('id, name, age_group')
        .eq('group_id', id)
        .order('name');

      if (teamsError) {
        logger.error('Error fetching group teams:', teamsError);
      }

      // Get staff for this group
      const { data: staff, error: staffError } = await supabase
        .from('group_staff')
        .select(`
          id,
          role,
          guardian:guardians!fk_group_staff_guardian_id (
            id,
            first_name,
            last_name,
            email
          )
        `)
        .eq('group_id', id);

      if (staffError) {
        logger.error('Error fetching group staff:', staffError);
      }

      const formattedStaff = staff?.map(s => ({
        id: (s.guardian as any).id,
        name: `${(s.guardian as any).first_name} ${(s.guardian as any).last_name}`,
        email: (s.guardian as any).email,
        role: s.role
      })) || [];

      return {
        ...group,
        teams: teams || [],
        staff: formattedStaff
      };
    } catch (error) {
      logger.warn('Failed to get group by id:', error);
      return null;
    }
  }

  async createGroup(group: Omit<Group, 'id' | 'created_at' | 'updated_at'>): Promise<Group> {
    try {
      const { data, error } = await supabase
        .from('groups')
        .insert(group)
        .select()
        .single();
      
      if (error) {
        logger.error('Error creating group:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      logger.error('Failed to create group:', error);
      throw error;
    }
  }

  async updateGroup(id: string, updates: Partial<Omit<Group, 'id' | 'created_at' | 'updated_at'>>): Promise<Group> {
    try {
      const { data, error } = await supabase
        .from('groups')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        logger.error('Error updating group:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      logger.error('Failed to update group:', error);
      throw error;
    }
  }

  async deleteGroup(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('groups')
        .delete()
        .eq('id', id);
      
      if (error) {
        logger.error('Error deleting group:', error);
        throw error;
      }
    } catch (error) {
      logger.error('Failed to delete group:', error);
      throw error;
    }
  }

  async addStaffToGroup(groupId: string, guardianId: string, role: string): Promise<GroupStaff> {
    try {
      const { data, error } = await supabase
        .from('group_staff')
        .insert({
          group_id: groupId,
          guardian_id: guardianId,
          role
        })
        .select()
        .single();
      
      if (error) {
        logger.error('Error adding staff to group:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      logger.error('Failed to add staff to group:', error);
      throw error;
    }
  }

  async removeStaffFromGroup(groupId: string, guardianId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('group_staff')
        .delete()
        .eq('group_id', groupId)
        .eq('guardian_id', guardianId);
      
      if (error) {
        logger.error('Error removing staff from group:', error);
        throw error;
      }
    } catch (error) {
      logger.error('Failed to remove staff from group:', error);
      throw error;
    }
  }
}
