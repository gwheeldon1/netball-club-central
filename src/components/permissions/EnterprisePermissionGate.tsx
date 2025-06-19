
import React from 'react';
import { useEnterprisePermissions } from '@/hooks/useEnterprisePermissions';
import { Permission, PermissionContext } from '@/store/types/permissions';
import { Skeleton } from '@/components/ui/skeleton';

interface EnterprisePermissionGateProps {
  permission: Permission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  context?: PermissionContext;
  loadingFallback?: React.ReactNode;
  requireAll?: boolean;
  permissions?: Permission[];
}

export const EnterprisePermissionGate: React.FC<EnterprisePermissionGateProps> = ({
  permission,
  permissions,
  children,
  fallback = null,
  context,
  loadingFallback,
  requireAll = false,
}) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions, loading } = useEnterprisePermissions();

  if (loading) {
    return <>{loadingFallback || <Skeleton className="h-8 w-full" />}</>;
  }

  let hasRequiredPermission = false;

  if (permissions && permissions.length > 0) {
    hasRequiredPermission = requireAll 
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);
  } else {
    hasRequiredPermission = hasPermission(permission, context);
  }

  if (!hasRequiredPermission) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
