
import { useEnterprisePermissions } from './useEnterprisePermissions';

// Legacy hook that wraps the new enterprise permissions hook
export const usePermissions = () => {
  const enterprisePermissions = useEnterprisePermissions();
  
  return {
    ...enterprisePermissions,
    // Legacy aliases
    checkPermission: enterprisePermissions.hasPermission,
    checkTeamAccess: enterprisePermissions.canAccessTeam,
  };
};
