import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/types/unified';
import { logger } from '@/utils/logger';

export interface UserRoleData {
  id: string;
  guardian_id: string;
  role: UserRole;
  team_id?: string;
  is_active: boolean;
  assigned_at: string;
  assigned_by?: string;
  guardians?: {
    first_name: string;
    last_name: string;
    email: string;
  };
  teams?: {
    name: string;
    age_group: string;
  };
}

export interface CreateUserRoleData {
  guardian_id: string;
  role: UserRole;
  team_id?: string;
}

export interface UpdateUserRoleData {
  role?: UserRole;
  team_id?: string;
  is_active?: boolean;
}

export const rolesApi = {
  // Get all user roles (admin only)
  async getAllUserRoles(): Promise<UserRoleData[]> {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select(`
          id,
          guardian_id,
          role,
          team_id,
          is_active,
          assigned_at,
          assigned_by,
          guardians!guardian_id(first_name, last_name, email),
          teams!team_id(name, age_group)
        `)
        .eq('is_active', true)
        .order('assigned_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error('Error fetching user roles:', error);
      throw error;
    }
  },

  // Get roles for a specific user
  async getUserRoles(guardianId: string): Promise<UserRole[]> {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('guardian_id', guardianId)
        .eq('is_active', true);

      if (error) throw error;
      return data?.map(r => r.role as UserRole) || [];
    } catch (error) {
      logger.error('Error fetching user roles:', error);
      return [];
    }
  },

  // Create a new user role
  async createUserRole(roleData: CreateUserRoleData): Promise<UserRoleData> {
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('user_roles')
        .insert({
          ...roleData,
          assigned_by: currentUser.user?.id
        })
        .select(`
          id,
          guardian_id,
          role,
          team_id,
          is_active,
          assigned_at,
          assigned_by,
          guardians!guardian_id(first_name, last_name, email),
          teams!team_id(name, age_group)
        `)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error creating user role:', error);
      throw error;
    }
  },

  // Update a user role
  async updateUserRole(roleId: string, updates: UpdateUserRoleData): Promise<UserRoleData> {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .update(updates)
        .eq('id', roleId)
        .select(`
          id,
          guardian_id,
          role,
          team_id,
          is_active,
          assigned_at,
          assigned_by,
          guardians!guardian_id(first_name, last_name, email),
          teams!team_id(name, age_group)
        `)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error updating user role:', error);
      throw error;
    }
  },

  // Delete/deactivate a user role
  async deleteUserRole(roleId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ is_active: false })
        .eq('id', roleId);

      if (error) throw error;
    } catch (error) {
      logger.error('Error deleting user role:', error);
      throw error;
    }
  },

  // Get available guardians for role assignment
  async getAvailableGuardians(): Promise<Array<{ id: string; first_name: string; last_name: string; email: string }>> {
    try {
      const { data, error } = await supabase
        .from('guardians')
        .select('id, first_name, last_name, email')
        .eq('approval_status', 'approved')
        .order('first_name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error('Error fetching available guardians:', error);
      throw error;
    }
  },

  // Get available teams for role assignment
  async getAvailableTeams(): Promise<Array<{ id: string; name: string; age_group: string }>> {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('id, name, age_group')
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error('Error fetching available teams:', error);
      throw error;
    }
  }
};