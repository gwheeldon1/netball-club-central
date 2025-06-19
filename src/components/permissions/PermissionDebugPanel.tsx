
import React, { useState } from 'react';
import { useEnterprisePermissions } from '@/hooks/useEnterprisePermissions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';

export const PermissionDebugPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { 
    getPermissionDebugInfo, 
    refetchPermissions, 
    loading,
    permissions,
    accessibleTeams,
    roles 
  } = useEnterprisePermissions();

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const debugInfo = getPermissionDebugInfo();

  return (
    <Card className="mt-8 border-2 border-dashed border-yellow-300 bg-yellow-50">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-yellow-100 transition-colors">
            <CardTitle className="flex items-center justify-between text-lg">
              <span>🔐 Permission Debug Panel (Development Only)</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    refetchPermissions();
                  }}
                  disabled={loading}
                >
                  <RefreshCw className={`h-3 w-3 mr-1 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="space-y-4">
            {debugInfo && (
              <>
                <div>
                  <h4 className="font-semibold mb-2">User Info:</h4>
                  <p className="text-sm">User ID: {debugInfo.userId}</p>
                  <p className="text-sm">Last Updated: {debugInfo.lastUpdated}</p>
                  <p className="text-sm">Expires At: {debugInfo.expiresAt}</p>
                  <p className="text-sm">
                    Status: <Badge variant={debugInfo.isExpired ? "destructive" : "default"}>
                      {debugInfo.isExpired ? "Expired" : "Valid"}
                    </Badge>
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Permissions ({permissions.length}):</h4>
                  <div className="flex flex-wrap gap-1">
                    {permissions.map(permission => (
                      <Badge key={permission} variant="secondary" className="text-xs">
                        {permission}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Accessible Teams ({accessibleTeams.length}):</h4>
                  <div className="flex flex-wrap gap-1">
                    {accessibleTeams.map(teamId => (
                      <Badge key={teamId} variant="outline" className="text-xs">
                        {teamId}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Roles ({roles.length}):</h4>
                  <div className="flex flex-wrap gap-1">
                    {roles.map(role => (
                      <Badge key={role} variant="default" className="text-xs">
                        {role}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
