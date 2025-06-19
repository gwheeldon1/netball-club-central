
import React from 'react';
import { usePermissions } from '@/hooks/usePermissions';

interface TeamAccessGateProps {
  teamId: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const TeamAccessGate: React.FC<TeamAccessGateProps> = ({
  teamId,
  children,
  fallback = null
}) => {
  const { canAccessTeam } = usePermissions();

  if (!canAccessTeam(teamId)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
