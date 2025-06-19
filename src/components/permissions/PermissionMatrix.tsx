
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Shield, Plus, Trash2, Edit } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface RolePermission {
  role: string;
  permission_id: string;
  permissions?: Permission;
}

interface PermissionMatrixData {
  [role: string]: string[];
}

export const PermissionMatrix = () => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>([]);
  const [matrix, setMatrix] = useState<PermissionMatrixData>({});
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newPermission, setNewPermission] = useState({
    name: '',
    description: '',
    category: ''
  });

  const roles = ['admin', 'manager', 'coach', 'parent'];
  const categories = ['teams', 'events', 'users', 'analytics', 'system', 'groups'];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load permissions
      const { data: permissionsData, error: permError } = await supabase
        .from('permissions')
        .select('*')
        .order('category', { ascending: true });

      if (permError) throw permError;

      // Load role permissions
      const { data: rolePermData, error: roleError } = await supabase
        .from('role_permissions')
        .select(`
          role,
          permission_id,
          permissions!inner(id, name, description, category)
        `);

      if (roleError) throw roleError;

      setPermissions(permissionsData || []);
      setRolePermissions(rolePermData || []);

      // Build matrix
      const matrixData: PermissionMatrixData = {};
      roles.forEach(role => {
        matrixData[role] = rolePermData
          ?.filter(rp => rp.role === role)
          .map(rp => rp.permission_id) || [];
      });
      setMatrix(matrixData);

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load permissions data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionToggle = async (role: string, permissionId: string, granted: boolean) => {
    try {
      if (granted) {
        // Add permission
        const { error } = await supabase
          .from('role_permissions')
          .insert({ role, permission_id: permissionId });
        
        if (error) throw error;
      } else {
        // Remove permission
        const { error } = await supabase
          .from('role_permissions')
          .delete()
          .eq('role', role)
          .eq('permission_id', permissionId);
        
        if (error) throw error;
      }

      // Update local state
      setMatrix(prev => ({
        ...prev,
        [role]: granted 
          ? [...(prev[role] || []), permissionId]
          : (prev[role] || []).filter(id => id !== permissionId)
      }));

      toast({
        title: "Success",
        description: `Permission ${granted ? 'granted' : 'revoked'} successfully`
      });

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update permission",
        variant: "destructive"
      });
    }
  };

  const handleCreatePermission = async () => {
    if (!newPermission.name || !newPermission.category) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('permissions')
        .insert([newPermission])
        .select()
        .single();

      if (error) throw error;

      setPermissions(prev => [...prev, data]);
      setNewPermission({ name: '', description: '', category: '' });
      setDialogOpen(false);

      toast({
        title: "Success",
        description: "Permission created successfully"
      });

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create permission",
        variant: "destructive"
      });
    }
  };

  const getCategoryPermissions = (category: string) => {
    return permissions.filter(p => p.category === category);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <p className="text-muted-foreground">Loading permissions...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Permission Matrix
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Manage role-based access control for your application
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Permission
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Permission</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Permission Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., events.create"
                    value={newPermission.name}
                    onChange={(e) => setNewPermission(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={newPermission.category}
                    onValueChange={(value) => setNewPermission(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe what this permission allows..."
                    value={newPermission.description}
                    onChange={(e) => setNewPermission(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreatePermission}>
                    Create Permission
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {categories.map(category => {
            const categoryPerms = getCategoryPermissions(category);
            if (categoryPerms.length === 0) return null;

            return (
              <div key={category} className="space-y-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold capitalize">{category}</h3>
                  <Badge variant="outline">{categoryPerms.length} permissions</Badge>
                </div>
                
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-muted/50 px-4 py-2 border-b">
                    <div className="grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-4 font-medium text-sm">Permission</div>
                      {roles.map(role => (
                        <div key={role} className="col-span-2 text-center">
                          <Badge variant="outline" className="capitalize">
                            {role}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="divide-y">
                    {categoryPerms.map(permission => (
                      <div key={permission.id} className="px-4 py-3">
                        <div className="grid grid-cols-12 gap-4 items-center">
                          <div className="col-span-4">
                            <div className="font-medium text-sm">{permission.name}</div>
                            {permission.description && (
                              <div className="text-xs text-muted-foreground mt-1">
                                {permission.description}
                              </div>
                            )}
                          </div>
                          {roles.map(role => (
                            <div key={role} className="col-span-2 flex justify-center">
                              <Checkbox
                                checked={matrix[role]?.includes(permission.id) || false}
                                onCheckedChange={(checked) => 
                                  handlePermissionToggle(role, permission.id, !!checked)
                                }
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}

          {permissions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No permissions found. Click "Add Permission" to get started.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
