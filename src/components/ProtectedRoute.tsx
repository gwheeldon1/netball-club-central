
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

const LoadingSkeleton = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="space-y-4 w-full max-w-md p-4">
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  </div>
);

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAuth = true,
  allowedRoles 
}) => {
  const { currentUser, loading, hasRole } = useAuth();

  console.log('ProtectedRoute: loading:', loading, 'user:', currentUser?.email, 'requireAuth:', requireAuth);

  if (loading) {
    console.log('ProtectedRoute: Still loading, showing skeleton');
    return <LoadingSkeleton />;
  }

  if (requireAuth && !currentUser) {
    console.log('ProtectedRoute: Auth required but no user, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  if (!requireAuth && currentUser) {
    console.log('ProtectedRoute: No auth required but user exists, redirecting to dashboard');
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && currentUser) {
    const hasRequiredRole = allowedRoles.some(role => hasRole(role));
    console.log('ProtectedRoute: Checking roles:', allowedRoles, 'has required role:', hasRequiredRole);
    if (!hasRequiredRole) {
      console.log('ProtectedRoute: User lacks required role, redirecting to unauthorized');
      return <Navigate to="/unauthorized" replace />;
    }
  }

  console.log('ProtectedRoute: All checks passed, rendering children');
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      {children}
    </Suspense>
  );
};

export default ProtectedRoute;
