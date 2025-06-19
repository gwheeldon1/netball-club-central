
import { useMemo, useCallback } from 'react';
import { useAppSelector } from '@/store/hooks';
import { useGetUserPermissionsQuery } from '@/store/api/permissionsApi';
import { Permission, PermissionContext, TeamPermission, EventPermission } from '@/store/types/permissions';

export const useEnterprisePermissions = () => {
  const user = useAppSelector(state => state.auth.user);
  
  const {
    data: userPermissions,
    isLoading: permissionsLoading,
    error: permissionsError,
    refetch: refetchPermissions,
  } = useGetUserPermissionsQuery(user?.id || '', {
    skip: !user?.id,
    pollingInterval: 5 * 60 * 1000,
    refetchOnMountOrArgChange: true,
  });

  const hasPermission = useCallback((
    permission: Permission, 
    context?: PermissionContext
  ): boolean => {
    if (!userPermissions) return false;

    const hasBasicPermission = userPermissions.permissions.includes(permission);
    
    if (context?.teamId) {
      const canAccessTeam = userPermissions.accessibleTeams.includes(context.teamId);
      
      if (permission.includes('.view.') && userPermissions.permissions.includes(permission.replace('.assigned', '.all') as Permission)) {
        return true;
      }
      
      if (permission.includes('.assigned')) {
        return hasBasicPermission && canAccessTeam;
      }
    }

    return hasBasicPermission;
  }, [userPermissions]);

  const canAccessTeam = useCallback((teamId: string): boolean => {
    if (!userPermissions) return false;
    
    if (userPermissions.permissions.includes(TeamPermission.VIEW_ALL)) {
      return true;
    }
    
    return userPermissions.accessibleTeams.includes(teamId);
  }, [userPermissions]);

  const hasRole = useCallback((role: string): boolean => {
    if (!userPermissions) return false;
    return userPermissions.roles.includes(role);
  }, [userPermissions]);

  const hasAnyPermission = useCallback((permissions: Permission[]): boolean => {
    return permissions.some(permission => hasPermission(permission));
  }, [hasPermission]);

  const hasAllPermissions = useCallback((permissions: Permission[]): boolean => {
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
