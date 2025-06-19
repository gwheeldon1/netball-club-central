
import { supabase } from '@/integrations/supabase/client';
import { Permission } from './types';

class PermissionService {
  private cache = new Map<string, { permissions: Permission[]; expiresAt: number }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

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
  }

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

  async hasPermission(userId: string, permission: Permission): Promise<boolean> {
    const cached = this.cache.get(userId);
    
    if (cached && Date.now() < cached.expiresAt) {
      return cached.permissions.includes(permission);
    }

    const permissions = await this.getUserPermissions(userId);
    this.cache.set(userId, {
      permissions,
      expiresAt: Date.now() + this.CACHE_DURATION
    });

    return permissions.includes(permission);
  }

  clearCache(userId?: string) {
    if (userId) {
      this.cache.delete(userId);
    } else {
      this.cache.clear();
    }
  }
}

export const permissionService = new PermissionService();
