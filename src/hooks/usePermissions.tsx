
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { permissionService } from '@/services/permissions/permissionService';
import { PermissionName, UserPermissions } from '@/services/permissions/types';
import { logger } from '@/utils/logger';

export const usePermissions = () => {
  const { currentUser } = useAuth();
  const [permissions, setPermissions] = useState<UserPermissions>({
    permissions: [],
    accessibleTeams: [],
    hasPermission: () => false,
    canAccessTeam: () => false
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPermissions = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        const userPermissions = await permissionService.getUserPermissions(currentUser.id);
        setPermissions(userPermissions);
      } catch (error) {
        logger.error('Error loading permissions:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPermissions();
  }, [currentUser]);

  const hasPermission = (permission: PermissionName): boolean => {
    return permissions.hasPermission(permission);
  };

  const canAccessTeam = (teamId: string): boolean => {
    return permissions.canAccessTeam(teamId);
  };

  const refreshPermissions = async () => {
    if (currentUser) {
      permissionService.clearCache(currentUser.id);
      const userPermissions = await permissionService.getUserPermissions(currentUser.id);
      setPermissions(userPermissions);
    }
  };

  // Legacy compatibility - map old permission checks to new system
  const isAdmin = hasPermission('teams.view.all'); // Admin has view all permission
  const isCoach = hasPermission('events.create') && !hasPermission('teams.view.all');
  const isManager = hasPermission('approvals.manage') && !hasPermission('teams.view.all');
  const isParent = hasPermission('teams.view.children') && !hasPermission('events.create');

  return {
    // New permission system
    hasPermission,
    canAccessTeam,
    refreshPermissions,
    permissions: permissions.permissions,
    accessibleTeams: permissions.accessibleTeams,
    loading,
    
    // Legacy compatibility
    isAdmin,
    isCoach,
    isManager,
    isParent,
    userTeams: permissions.accessibleTeams,
    canViewTeam: canAccessTeam,
    canEditTeam: (teamId: string) => 
      hasPermission('teams.edit.all') || 
      (hasPermission('teams.edit.assigned') && canAccessTeam(teamId)),
    canViewAllUsers: hasPermission('users.view.all'),
    canManageRoles: hasPermission('roles.assign'),
    canApproveRegistrations: hasPermission('approvals.manage')
  };
};
