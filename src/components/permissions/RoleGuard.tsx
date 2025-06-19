
import React from 'react';
import { useEnterprisePermissions } from '@/hooks/useEnterprisePermissions';
import { UserRole } from '@/types/unified';
import { Skeleton } from '@/components/ui/skeleton';

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
  loadingFallback?: React.ReactNode;
  requireAll?: boolean;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  allowedRoles,
  children,
  fallback = null,
  loadingFallback,
  requireAll = false,
}) => {
  const { hasRole, loading } = useEnterprisePermissions();

  if (loading) {
    return <>{loadingFallback || <Skeleton className="h-8 w-full" />}</>;
  }

  const hasRequiredRole = requireAll
    ? allowedRoles.every(role => hasRole(role))
    : allowedRoles.some(role => hasRole(role));

  if (!hasRequiredRole) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
