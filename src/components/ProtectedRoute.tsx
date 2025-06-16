
import React, { Suspense } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAuth = true 
}) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (requireAuth && !currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (!requireAuth && currentUser) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <Suspense fallback={<LoadingSkeleton />}>
      {children}
    </Suspense>
  );
};

export default ProtectedRoute;
