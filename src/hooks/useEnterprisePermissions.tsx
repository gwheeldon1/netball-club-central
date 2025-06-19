
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface UserPermissions {
  permissions: string[];
  accessibleTeams: string[];
  roles: string[];
  lastUpdated: number;
  expiresAt: number;
}

export const useEnterprisePermissions = () => {
  const { user } = useAuth();
  const [userPermissions, setUserPermissions] = useState<UserPermissions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPermissions = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch permissions
      const { data: permissionsData, error: permError } = await supabase
        .rpc('get_user_permissions', { user_id: user.id });

      if (permError) throw permError;

      // Fetch accessible teams
      const { data: teamsData, error: teamsError } = await supabase
        .rpc('get_accessible_teams', { user_id: user.id });

      if (teamsError) throw teamsError;

      // Fetch roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('guardian_id', user.id)
        .eq('is_active', true);

      if (rolesError) {
        console.error('Error fetching roles:', rolesError);
      }

      const permissions: UserPermissions = {
        permissions: permissionsData?.map((p: any) => p.permission_name) || [],
        accessibleTeams: teamsData?.map((t: any) => t.team_id) || [],
        roles: rolesData?.map((r: any) => r.role) || [],
        lastUpdated: Date.now(),
        expiresAt: Date.now() + (5 * 60 * 1000),
      };

      setUserPermissions(permissions);
    } catch (err) {
      setError(String(err));
      console.error('Error fetching permissions:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  const hasPermission = useCallback((permission: string): boolean => {
    return userPermissions?.permissions.includes(permission) || false;
  }, [userPermissions]);

  const canAccessTeam = useCallback((teamId: string): boolean => {
    return userPermissions?.accessibleTeams.includes(teamId) || false;
  }, [userPermissions]);

  const hasRole = useCallback((role: string): boolean => {
    return userPermissions?.roles.includes(role) || false;
  }, [userPermissions]);

  const hasAnyPermission = useCallback((permissions: string[]): boolean => {
    return permissions.some(permission => hasPermission(permission));
  }, [hasPermission]);

  const hasAllPermissions = useCallback((permissions: string[]): boolean => {
    return permissions.every(permission => hasPermission(permission));
  }, [hasPermission]);

  const getPermissionDebugInfo = useCallback(() => {
    if (!userPermissions) return null;
    
    return {
      userId: user?.id,
      permissions: userPermissions.permissions,
      accessibleTeams: userPermissions.accessibleTeams,
      roles: userPermissions.roles,
      lastUpdated: new Date(userPermissions.lastUpdated).toISOString(),
      expiresAt: new Date(userPermissions.expiresAt).toISOString(),
      isExpired: Date.now() > userPermissions.expiresAt,
    };
  }, [userPermissions, user?.id]);

  // Legacy compatibility
  const isAdmin = hasPermission('teams.view.all');
  const isCoach = hasPermission('events.create') && !hasPermission('teams.view.all');
  const isManager = hasPermission('approvals.manage') && !hasPermission('teams.view.all');
  const isParent = hasPermission('teams.view.children') && !hasPermission('events.create');

  return {
    userPermissions,
    loading,
    error,
    
    hasPermission,
    canAccessTeam,
    hasRole,
    hasAnyPermission,
    hasAllPermissions,
    
    refetchPermissions: fetchPermissions,
    getPermissionDebugInfo,
    
    // Legacy compatibility
    isAdmin,
    isCoach,
    isManager,
    isParent,
    
    permissions: userPermissions?.permissions || [],
    accessibleTeams: userPermissions?.accessibleTeams || [],
    roles: userPermissions?.roles || [],
  };
};
