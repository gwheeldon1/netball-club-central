
import React from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { PermissionName } from '@/services/permissions/types';

interface PermissionGateProps {
  permission: PermissionName;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  teamId?: string; // For team-specific permissions
}

export const PermissionGate: React.FC<PermissionGateProps> = ({
  permission,
  children,
  fallback = null,
  teamId
}) => {
  const { hasPermission, canAccessTeam } = usePermissions();

  // Check if user has the required permission
  const hasRequiredPermission = hasPermission(permission);
  
  // For team-specific permissions, also check team access
  const hasTeamAccess = teamId ? canAccessTeam(teamId) : true;

  if (!hasRequiredPermission || !hasTeamAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
