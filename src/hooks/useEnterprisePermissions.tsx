
import { useMemo, useCallback } from 'react';
import { useAppSelector } from '@/store/hooks';
import { useGetUserPermissionsQuery, useCheckPermissionQuery } from '@/store/api/permissionsApi';
import { Permission, PermissionContext, TeamPermission, EventPermission } from '@/store/types/permissions';
import { logger } from '@/utils/logger';

export const useEnterprisePermissions = () => {
  const user = useAppSelector(state => state.auth.user);
  
  const {
    data: userPermissions,
    isLoading: permissionsLoading,
    error: permissionsError,
    refetch: refetchPermissions,
  } = useGetUserPermissionsQuery(user?.id || '', {
    skip: !user?.id,
    pollingInterval: 5 * 60 * 1000, // Poll every 5 minutes
    refetchOnMountOrArgChange: true,
  });

  // Enhanced permission checking with context
  const hasPermission = useCallback((
    permission: Permission, 
    context?: PermissionContext
  ): boolean => {
    if (!userPermissions) return false;

    // Basic permission check
    const hasBasicPermission = userPermissions.permissions.includes(permission);
    
    // Context-aware permission checking
    if (context?.teamId) {
      // For team-specific permissions, also check team access
      const canAccessTeam = userPermissions.accessibleTeams.includes(context.teamId);
      
      // If user has view.all permission, they can access any team
      if (permission.includes('.view.') && userPermissions.permissions.includes(permission.replace('.assigned', '.all') as Permission)) {
        return true;
      }
      
      // For assigned permissions, check both permission and team access
      if (permission.includes('.assigned')) {
        return hasBasicPermission && canAccessTeam;
      }
    }

    return hasBasicPermission;
  }, [userPermissions]);

  // Team access checking
  const canAccessTeam = useCallback((teamId: string): boolean => {
    if (!userPermissions) return false;
    
    // Admin can access all teams
    if (userPermissions.permissions.includes(TeamPermission.VIEW_ALL)) {
      return true;
    }
    
    // Check if team is in accessible teams list
    return userPermissions.accessibleTeams.includes(teamId);
  }, [userPermissions]);

  // Role checking
  const hasRole = useCallback((role: string): boolean => {
    if (!userPermissions) return false;
    return userPermissions.roles.includes(role);
  }, [userPermissions]);

  // Bulk permission checking
  const hasAnyPermission = useCallback((permissions: Permission[]): boolean => {
    return permissions.some(permission => hasPermission(permission));
  }, [hasPermission]);

  const hasAllPermissions = useCallback((permissions: Permission[]): boolean => {
    return permissions.every(permission => hasPermission(permission));
  }, [hasPermission]);

  // Permission debugging helpers
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
  const legacyPermissions = useMemo(() => {
    if (!userPermissions) {
      return {
        isAdmin: false,
        isCoach: false,
        isManager: false,
        isParent: false,
      };
    }

    return {
      isAdmin: hasPermission(TeamPermission.VIEW_ALL),
      isCoach: hasPermission(EventPermission.CREATE) && !hasPermission(TeamPermission.VIEW_ALL),
      isManager: hasPermission('approvals.manage' as Permission) && !hasPermission(TeamPermission.VIEW_ALL),
      isParent: hasPermission(TeamPermission.VIEW_CHILDREN) && !hasPermission(EventPermission.CREATE),
    };
  }, [userPermissions, hasPermission]);

  // Performance monitoring
  const logPermissionCheck = useCallback((permission: Permission, result: boolean, context?: PermissionContext) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔐 Permission Check:', {
        permission,
        result,
        context,
        timestamp: new Date().toISOString(),
      });
    }
  }, []);

  return {
    // Core permission data
    userPermissions,
    loading: permissionsLoading,
    error: permissionsError,
    
    // Permission checking functions
    hasPermission: useCallback((permission: Permission, context?: PermissionContext) => {
      const result = hasPermission(permission, context);
      logPermissionCheck(permission, result, context);
      return result;
    }, [hasPermission, logPermissionCheck]),
    
    canAccessTeam,
    hasRole,
    hasAnyPermission,
    hasAllPermissions,
    
    // Utility functions
    refetchPermissions,
    getPermissionDebugInfo,
    
    // Legacy compatibility
    ...legacyPermissions,
    
    // Convenience properties
    permissions: userPermissions?.permissions || [],
    accessibleTeams: userPermissions?.accessibleTeams || [],
    roles: userPermissions?.roles || [],
  };
};
