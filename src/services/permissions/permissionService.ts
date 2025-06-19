
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';
import { PermissionName, UserPermissions } from './types';

class PermissionService {
  private permissionsCache = new Map<string, UserPermissions>();
  private cacheExpiry = new Map<string, number>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  async getUserPermissions(userId: string): Promise<UserPermissions> {
    // Check cache first
    const cached = this.getCachedPermissions(userId);
    if (cached) {
      return cached;
    }

    try {
      // Get user permissions from database function
      const { data: permissionsData, error: permError } = await supabase
        .rpc('get_user_permissions', { user_id: userId });

      if (permError) {
        logger.error('Error fetching user permissions:', permError);
        return this.getDefaultPermissions();
      }

      // Get accessible teams
      const { data: teamsData, error: teamsError } = await supabase
        .rpc('get_accessible_teams', { user_id: userId });

      if (teamsError) {
        logger.error('Error fetching accessible teams:', teamsError);
      }

      // Type assertion: database returns strings that should be valid PermissionName values
      const permissions = (permissionsData?.map(p => p.permission_name) || []) as PermissionName[];
      const accessibleTeams = teamsData?.map(t => t.team_id) || [];

      const userPermissions: UserPermissions = {
        permissions,
        accessibleTeams,
        hasPermission: (permission: PermissionName) => permissions.includes(permission),
        canAccessTeam: (teamId: string) => accessibleTeams.includes(teamId)
      };

      // Cache the result
      this.setCachedPermissions(userId, userPermissions);
      
      return userPermissions;
    } catch (error) {
      logger.error('Error in getUserPermissions:', error);
      return this.getDefaultPermissions();
    }
  }

  async hasPermission(userId: string, permission: PermissionName): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .rpc('has_permission', { 
          user_id: userId, 
          permission_name: permission 
        });

      if (error) {
        logger.error('Error checking permission:', error);
        return false;
      }

      return data || false;
    } catch (error) {
      logger.error('Error in hasPermission:', error);
      return false;
    }
  }

  async getAccessibleTeams(userId: string): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .rpc('get_accessible_teams', { user_id: userId });

      if (error) {
        logger.error('Error fetching accessible teams:', error);
        return [];
      }

      return data?.map(t => t.team_id) || [];
    } catch (error) {
      logger.error('Error in getAccessibleTeams:', error);
      return [];
    }
  }

  clearCache(userId?: string) {
    if (userId) {
      this.permissionsCache.delete(userId);
      this.cacheExpiry.delete(userId);
    } else {
      this.permissionsCache.clear();
      this.cacheExpiry.clear();
    }
  }

  private getCachedPermissions(userId: string): UserPermissions | null {
    const expiry = this.cacheExpiry.get(userId);
    if (!expiry || Date.now() > expiry) {
      this.permissionsCache.delete(userId);
      this.cacheExpiry.delete(userId);
      return null;
    }
    return this.permissionsCache.get(userId) || null;
  }

  private setCachedPermissions(userId: string, permissions: UserPermissions) {
    this.permissionsCache.set(userId, permissions);
    this.cacheExpiry.set(userId, Date.now() + this.CACHE_DURATION);
  }

  private getDefaultPermissions(): UserPermissions {
    return {
      permissions: [],
      accessibleTeams: [],
      hasPermission: () => false,
      canAccessTeam: () => false
    };
  }
}

export const permissionService = new PermissionService();
