import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/types/unified';
import { logger } from '@/utils/logger';

// Raw types from Supabase
interface RawGuardianData {
  first_name: string | null;
  last_name: string | null;
  email: string | null;
}

interface RawTeamData {
  name: string | null;
  age_group: string | null;
}

interface RawUserRoleData {
  id: string;
  guardian_id: string | null;
  role: string | null;
  team_id?: string | null;
  is_active: boolean | null;
  assigned_at: string | null;
  assigned_by?: string | null;
  guardians?: RawGuardianData | null;
  teams?: RawTeamData | null;
}

// Application-level type (already defined in the file)
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

function mapRawToUserRoleData(raw: RawUserRoleData): UserRoleData {
  if (!raw.guardian_id || !raw.role || raw.is_active === null || !raw.assigned_at) {
    logger.error('mapRawToUserRoleData: Core field missing or null', raw);
  }
  return {
    id: raw.id,
    guardian_id: raw.guardian_id || 'MISSING_GUARDIAN_ID',
    role: (raw.role || 'parent') as UserRole,
    team_id: raw.team_id || undefined,
    is_active: raw.is_active === null ? false : raw.is_active,
    assigned_at: raw.assigned_at || new Date().toISOString(),
    assigned_by: raw.assigned_by || undefined,
    guardians: raw.guardians ? {
      first_name: raw.guardians.first_name || '',
      last_name: raw.guardians.last_name || '',
      email: raw.guardians.email || '',
    } : undefined,
    teams: raw.teams ? {
      name: raw.teams.name || '',
      age_group: raw.teams.age_group || '',
    } : undefined,
  };
}

// For getAvailableGuardians
interface RawAvailableGuardian {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
}
type AppAvailableGuardian = { id: string; first_name: string; last_name: string; email: string; };

function mapRawToAvailableGuardian(raw: RawAvailableGuardian): AppAvailableGuardian {
  return {
    id: raw.id,
    first_name: raw.first_name || '',
    last_name: raw.last_name || '',
    email: raw.email || '',
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
      const rawData = data as RawUserRoleData[] || [];
      return rawData.map(mapRawToUserRoleData);
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
      return mapRawToUserRoleData(data as RawUserRoleData);
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
      return mapRawToUserRoleData(data as RawUserRoleData);
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
      const rawData = data as RawAvailableGuardian[] || [];
      return rawData.map(mapRawToAvailableGuardian);
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