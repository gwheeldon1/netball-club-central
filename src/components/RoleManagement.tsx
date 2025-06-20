
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, Users, Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface RoleData {
  role: 'admin' | 'manager' | 'coach' | 'parent';
  count: number;
  users: Array<{
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  }>;
}

export const RoleManagement = () => {
  const [roleData, setRoleData] = useState<RoleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'admin' | 'manager' | 'coach' | 'parent'>('parent');

  const roles = [
    { value: 'admin' as const, label: 'Administrator', description: 'Full system access' },
    { value: 'manager' as const, label: 'Manager', description: 'Team and event management' },
    { value: 'coach' as const, label: 'Coach', description: 'Team coaching and training' },
    { value: 'parent' as const, label: 'Parent', description: 'Child and team viewing' }
  ];

  useEffect(() => {
    loadRoleData();
  }, []);

  const loadRoleData = async () => {
    try {
      setLoading(true);
      
      const rolePromises = roles.map(async (role) => {
        const { data, error } = await supabase
          .from('user_roles')
          .select(`
            guardian_id,
            guardians!inner(id, first_name, last_name, email)
          `)
          .eq('role', role.value)
          .eq('is_active', true);

        if (error) throw error;

        return {
          role: role.value,
          count: data?.length || 0,
          users: data?.map(item => ({
            id: item.guardian_id,
            first_name: item.guardians?.first_name || '',
            last_name: item.guardians?.last_name || '',
            email: item.guardians?.email || ''
          })) || []
        };
      });

      const results = await Promise.all(rolePromises);
      setRoleData(results);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load role data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'manager': return 'default';
      case 'coach': return 'secondary';
      case 'parent': return 'outline';
      default: return 'outline';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <p className="text-muted-foreground">Loading role data...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Role Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {roles.map((role) => {
              const data = roleData.find(rd => rd.role === role.value);
              return (
                <div key={role.value} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant={getRoleColor(role.value)} className="capitalize">
                      {role.label}
                    </Badge>
                    <span className="text-2xl font-bold">{data?.count || 0}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{role.description}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {roleData.map((data) => {
        const roleInfo = roles.find(r => r.value === data.role);
        if (!roleInfo || data.count === 0) return null;

        return (
          <Card key={data.role}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                {roleInfo.label}s ({data.count})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.users.map((user) => (
                  <div key={user.id} className="p-3 border rounded-lg">
                    <h4 className="font-medium">{user.first_name} {user.last_name}</h4>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {roleData.every(rd => rd.count === 0) && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground mb-4">No users have been assigned roles yet</p>
            <p className="text-sm text-muted-foreground text-center">
              Assign roles to users in the User Management section to manage access control.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
