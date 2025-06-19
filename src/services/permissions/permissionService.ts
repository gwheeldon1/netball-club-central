
import { supabase } from '@/integrations/supabase/client';
import { Permission } from '@/store/types/permissions';

export const permissionService = {
  async getUserPermissions(userId: string): Promise<Permission[]> {
    try {
      const { data, error } = await supabase
        .rpc('get_user_permissions', { user_id: userId });

      if (error) throw error;
      return data?.map((p: any) => p.permission_name) || [];
    } catch (error) {
      console.error('Error fetching permissions:', error);
      return [];
    }
  },

  async getAccessibleTeams(userId: string): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .rpc('get_accessible_teams', { user_id: userId });

      if (error) throw error;
      return data?.map((t: any) => t.team_id) || [];
    } catch (error) {
      console.error('Error fetching accessible teams:', error);
      return [];
    }
  }
};
