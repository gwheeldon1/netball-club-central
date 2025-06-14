import React from 'react';
import { UserRole } from '@/types/unified';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

interface RoleBasedAccessProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const RoleBasedAccess: React.FC<RoleBasedAccessProps> = ({
  allowedRoles,
  children,
  fallback = null
}) => {
  const { user } = useAuth();
  const [userRoles, setUserRoles] = React.useState<UserRole[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchUserRoles = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('guardian_id', user.id)
          .eq('is_active', true);

        if (error) {
          logger.error('Error fetching user roles:', error);
          setUserRoles(['parent']); // Default role
        } else {
          const roles = data?.map(r => r.role as UserRole) || ['parent'];
          setUserRoles(roles);
        }
      } catch (error) {
        logger.error('Unexpected error fetching roles:', error);
        setUserRoles(['parent']); // Default role
      } finally {
        setLoading(false);
      }
    };

    fetchUserRoles();
  }, [user]);

  if (loading) {
    return <div className="animate-pulse bg-muted h-4 w-full rounded"></div>;
  }

  const hasRequiredRole = allowedRoles.some(role => userRoles.includes(role));

  if (!hasRequiredRole) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};