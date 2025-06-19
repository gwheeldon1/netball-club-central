
import { useMemo, useCallback } from 'react';
import { useAppSelector } from '@/store/hooks';
import { useGetUserPermissionsQuery } from '@/store/api/permissionsApi';

export const useEnterprisePermissions = () => {
  const user = useAppSelector(state => state.auth.user);
  
  const {
    data: userPermissions,
    isLoading: permissionsLoading,
    error: permissionsError,
    refetch: refetchPermissions,
  } = useGetUserPermissionsQuery(user?.id || '', {
    skip: !user?.id,
  });

  const hasPermission = useCallback((permission: string): boolean => {
    if (!userPermissions) return false;
    return userPermissions.permissions.includes(permission);
  }, [userPermissions]);

  const canAccessTeam = useCallback((teamId: string): boolean => {
    if (!userPermissions) return false;
    return userPermissions.accessibleTeams.includes(teamId);
  }, [userPermissions]);

  const hasRole = useCallback((role: string): boolean => {
    if (!userPermissions) return false;
    return userPermissions.roles.includes(role);
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
      isAdmin: hasPermission('teams.view.all'),
      isCoach: hasPermission('events.create') && !hasPermission('teams.view.all'),
      isManager: hasPermission('approvals.manage') && !hasPermission('teams.view.all'),
      isParent: hasPermission('teams.view.children') && !hasPermission('events.create'),
    };
  }, [userPermissions, hasPermission]);

  return {
    userPermissions,
    loading: permissionsLoading,
    error: permissionsError,
    
    hasPermission,
    canAccessTeam,
    hasRole,
    hasAnyPermission,
    hasAllPermissions,
    
    refetchPermissions,
    getPermissionDebugInfo,
    
    ...legacyPermissions,
    
    permissions: userPermissions?.permissions || [],
    accessibleTeams: userPermissions?.accessibleTeams || [],
    roles: userPermissions?.roles || [],
  };
};
