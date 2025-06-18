
import React, { Suspense } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { UserRole } from '@/types/unified';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  allowedRoles?: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAuth = true,
  allowedRoles 
}) => {
  const { currentUser, loading, hasRole } = useAuth();

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
