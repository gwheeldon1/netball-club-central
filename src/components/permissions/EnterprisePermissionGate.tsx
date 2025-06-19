
import React from 'react';
import { useEnterprisePermissions } from '@/hooks/useEnterprisePermissions';
import { Skeleton } from '@/components/ui/skeleton';

interface EnterprisePermissionGateProps {
  permission: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  loadingFallback?: React.ReactNode;
  requireAll?: boolean;
  permissions?: string[];
}

export const EnterprisePermissionGate: React.FC<EnterprisePermissionGateProps> = ({
  permission,
  permissions,
  children,
  fallback = null,
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
    hasRequiredPermission = hasPermission(permission);
  }

  if (!hasRequiredPermission) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
