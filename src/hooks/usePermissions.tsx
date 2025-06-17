
import { useState, useEffect, startTransition } from 'react';
import { useAuth } from '@/context/AuthContext';
// Role checking now handled through auth context
import { logger } from '@/utils/logger';

interface UserPermissions {
  isAdmin: boolean;
  isCoach: boolean;
  isManager: boolean;
  isParent: boolean;
  userTeams: string[];
  canViewTeam: (teamId: string) => boolean;
  canEditTeam: (teamId: string) => boolean;
  canViewAllUsers: boolean;
  canManageRoles: boolean;
  canApproveRegistrations: boolean;
}

export const usePermissions = (): UserPermissions => {
  const { currentUser, hasRole } = useAuth();
  const [userTeams, setUserTeams] = useState<string[]>([]);

  useEffect(() => {
    const loadUserTeams = async () => {
      if (!currentUser) {
        // setLoading(false); // setLoading was here, but loading state is removed
        return;
      }

      try {
        // Role loading will be handled through auth context for now
        startTransition(() => {
          setUserTeams([]);
        });
      } catch (error) {
        logger.error('Error loading user teams:', error);
        startTransition(() => {
          setUserTeams([]);
        });
      } finally {
        // setLoading(false); // setLoading was here, but loading state is removed
      }
    };

    loadUserTeams();
  }, [currentUser]);

  const isAdmin = hasRole('admin');
  const isCoach = hasRole('coach');
  const isManager = hasRole('manager');
  const isParent = hasRole('parent');

  const canViewTeam = (teamId: string): boolean => {
    return isAdmin || userTeams.includes(teamId);
  };

  const canEditTeam = (teamId: string): boolean => {
    return isAdmin || (isManager && userTeams.includes(teamId));
  };

  const canViewAllUsers = isAdmin;
  const canManageRoles = isAdmin;
  const canApproveRegistrations = isAdmin || isCoach || isManager;

  return {
    isAdmin,
    isCoach,
    isManager,
    isParent,
    userTeams,
    canViewTeam,
    canEditTeam,
    canViewAllUsers,
    canManageRoles,
    canApproveRegistrations,
  };
};
