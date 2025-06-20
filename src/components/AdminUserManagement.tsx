
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Users, Search, Plus, Edit, Trash2, Shield } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Guardian {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  approval_status: string;
  created_at: string;
}

interface UserRole {
  id: string;
  role: 'admin' | 'manager' | 'coach' | 'parent';
  is_active: boolean;
  assigned_at: string;
}

export const AdminUserManagement = () => {
  const [users, setUsers] = useState<Guardian[]>([]);
  const [userRoles, setUserRoles] = useState<{ [userId: string]: UserRole[] }>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Guardian | null>(null);

  const roles = ['admin', 'manager', 'coach', 'parent'] as const;
  const statusOptions = [
    { value: 'all', label: 'All Users' },
    { value: 'pending', label: 'Pending Approval' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' }
  ];

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      
      // Load guardians
      const { data: guardiansData, error: guardiansError } = await supabase
        .from('guardians')
        .select('*')
        .order('created_at', { ascending: false });

      if (guardiansError) throw guardiansError;

      // Load user roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('is_active', true);

      if (rolesError) throw rolesError;

      // Group roles by user
      const rolesByUser: { [userId: string]: UserRole[] } = {};
      rolesData?.forEach(role => {
        if (!rolesByUser[role.guardian_id]) {
          rolesByUser[role.guardian_id] = [];
        }
        rolesByUser[role.guardian_id].push(role);
      });

      setUsers(guardiansData || []);
      setUserRoles(rolesByUser);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUserStatus = async (userId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('guardians')
        .update({ approval_status: status })
        .eq('id', userId);

      if (error) throw error;

      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, approval_status: status } : user
      ));

      toast({
        title: "Success",
        description: `User status updated to ${status}`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user status",
        variant: "destructive"
      });
    }
  };

  const assignRole = async (userId: string, role: typeof roles[number]) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .insert({
          guardian_id: userId,
          role: role,
          is_active: true
        });

      if (error) throw error;

      // Reload users to get updated roles
      await loadUsers();

      toast({
        title: "Success",
        description: `Role ${role} assigned successfully`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to assign role",
        variant: "destructive"
      });
    }
  };

  const removeRole = async (roleId: string) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ is_active: false })
        .eq('id', roleId);

      if (error) throw error;

      // Reload users to get updated roles
      await loadUsers();

      toast({
        title: "Success",
        description: "Role removed successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove role",
        variant: "destructive"
      });
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = searchTerm === "" || 
      user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || user.approval_status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'approved': return 'default';
      case 'pending': return 'secondary';
      case 'rejected': return 'destructive';
      default: return 'outline';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <p className="text-muted-foreground">Loading users...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          User Management
        </CardTitle>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredUsers.map(user => (
            <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarFallback>
                    {user.first_name[0]}{user.last_name[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">{user.first_name} {user.last_name}</h3>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={getStatusBadgeVariant(user.approval_status)}>
                      {user.approval_status}
                    </Badge>
                    {userRoles[user.id]?.map(role => (
                      <Badge key={role.id} variant="outline" className="capitalize">
                        {role.role}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {user.approval_status === 'pending' && (
                  <>
                    <Button 
                      size="sm" 
                      onClick={() => updateUserStatus(user.id, 'approved')}
                    >
                      Approve
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => updateUserStatus(user.id, 'rejected')}
                    >
                      Reject
                    </Button>
                  </>
                )}
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">
                      <Shield className="h-4 w-4 mr-1" />
                      Roles
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Manage Roles - {user.first_name} {user.last_name}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Current Roles</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {userRoles[user.id]?.map(role => (
                            <div key={role.id} className="flex items-center gap-1">
                              <Badge variant="outline" className="capitalize">
                                {role.role}
                              </Badge>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removeRole(role.id)}
                                className="h-5 w-5 p-0"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                          {(!userRoles[user.id] || userRoles[user.id].length === 0) && (
                            <p className="text-sm text-muted-foreground">No roles assigned</p>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <Label>Assign New Role</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {roles.map(role => {
                            const hasRole = userRoles[user.id]?.some(ur => ur.role === role);
                            return (
                              <Button
                                key={role}
                                size="sm"
                                variant={hasRole ? "secondary" : "outline"}
                                onClick={() => !hasRole && assignRole(user.id, role)}
                                disabled={hasRole}
                                className="capitalize"
                              >
                                {role}
                              </Button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          ))}
          
          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No users found matching your criteria</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Add default export for lazy loading compatibility
export default AdminUserManagement;
