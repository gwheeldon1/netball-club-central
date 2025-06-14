import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types/unified';
import { logger } from '@/utils/logger';

interface UseUserRolesResult {
  roles: UserRole[];
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  loading: boolean;
  error: string | null;
}

export function useUserRoles(): UseUserRolesResult {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: roles = [], isLoading, error } = useQuery({
    queryKey: ['user-roles', user?.id],
    queryFn: async (): Promise<UserRole[]> => {
      if (!user) return [];

      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('guardian_id', user.id)
          .eq('is_active', true);

        if (error) throw error;

        return data?.map(r => r.role as UserRole) || ['parent'];
      } catch (err) {
        logger.error('Error fetching user roles:', err);
        return ['parent']; // Default fallback
      }
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  const hasRole = (role: UserRole): boolean => {
    return roles.includes(role);
  };

  const hasAnyRole = (checkRoles: UserRole[]): boolean => {
    return checkRoles.some(role => roles.includes(role));
  };

  return {
    roles,
    hasRole,
    hasAnyRole,
    loading: isLoading,
    error: error ? String(error) : null
  };
}