
import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { UserRole } from "@/types/unified";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
}

const ProtectedRoute = ({ 
  children, 
  allowedRoles 
}: ProtectedRouteProps) => {
  const { currentUser, hasRole } = useAuth();

  // Check if user is authenticated
  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  // If roles are specified, check if user has the required role
  if (allowedRoles && allowedRoles.length > 0) {
    const hasAllowedRole = allowedRoles.some(role => hasRole(role));
    
    if (!hasAllowedRole) {
      return <Navigate to="/unauthorized" />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
