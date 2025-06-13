import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabaseRoleApi } from '@/services/supabaseApi';

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserTeams = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        const roles = await supabaseRoleApi.getUserRoles(currentUser.id);
        const teams = roles
          .filter(r => r.isActive && r.teamId)
          .map(r => r.teamId!);
        setUserTeams(teams);
      } catch (error) {
        console.error('Error loading user teams:', error);
        setUserTeams([]);
      } finally {
        setLoading(false);
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