
import React, { Suspense } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { UserRole } from '@/types/unified';
import { usePermissions } from '@/hooks/usePermissions';
import { PermissionName } from '@/services/permissions/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  allowedRoles?: UserRole[];
  requiredPermission?: PermissionName;
  teamId?: string; // For team-specific access
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAuth = true,
  allowedRoles,
  requiredPermission,
  teamId
}) => {
  const { currentUser, loading: authLoading, hasRole } = useAuth();
  const { hasPermission, canAccessTeam, loading: permissionsLoading } = usePermissions();

  const loading = authLoading || permissionsLoading;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="space-y-4 w-full max-w-md p-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    );
  }

  if (requireAuth && !currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (!requireAuth && currentUser) {
    return <Navigate to="/" replace />;
  }

  // Check permission-based access (new system)
  if (requiredPermission && currentUser) {
    const hasRequiredPermission = hasPermission(requiredPermission);
    if (!hasRequiredPermission) {
      return <Navigate to="/unauthorized" replace />;
    }

    // If teamId is provided, check team access as well
    if (teamId && !canAccessTeam(teamId)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // Check role-based access (legacy compatibility)
  if (allowedRoles && currentUser) {
    const hasRequiredRole = allowedRoles.some(role => hasRole(role));
    if (!hasRequiredRole) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="space-y-4 w-full max-w-md p-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    }>
      {children}
    </Suspense>
  );
};

export default ProtectedRoute;
