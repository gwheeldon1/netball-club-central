import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, Shield, Users, Crown, Edit, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { rolesApi, UserRoleData, CreateUserRoleData } from "@/services/api/roles";
import { UserRole } from "@/types/unified";
import { useAuth } from "@/context/AuthContext";

export const RoleManagement = () => {
  const [loading, setLoading] = useState(false);
  const [userRoles, setUserRoles] = useState<UserRoleData[]>([]);
  const [availableGuardians, setAvailableGuardians] = useState<any[]>([]);
  const [availableTeams, setAvailableTeams] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<UserRoleData | null>(null);
  const [formData, setFormData] = useState<CreateUserRoleData>({
    guardian_id: '',
    role: 'parent' as UserRole,
    team_id: undefined
  });
  
  const { refreshUserRoles } = useAuth();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [roles, guardians, teams] = await Promise.all([
        rolesApi.getAllUserRoles(),
        rolesApi.getAvailableGuardians(),
        rolesApi.getAvailableTeams()
      ]);
      setUserRoles(roles);
      setAvailableGuardians(guardians);
      setAvailableTeams(teams);
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

  const handleCreateRole = async () => {
    if (!formData.guardian_id || !formData.role) {
      toast({
        title: "Error",
        description: "Please select a user and role",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      await rolesApi.createUserRole(formData);
      toast({
        title: "Success",
        description: "Role assigned successfully"
      });
      await loadData();
      await refreshUserRoles();
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to assign role",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async () => {
    if (!editingRole) return;

    try {
      setLoading(true);
      await rolesApi.updateUserRole(editingRole.id, {
        role: formData.role,
        team_id: formData.team_id
      });
      toast({
        title: "Success",
        description: "Role updated successfully"
      });
      await loadData();
      await refreshUserRoles();
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update role",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    if (!confirm("Are you sure you want to remove this role?")) return;

    try {
      setLoading(true);
      await rolesApi.deleteUserRole(roleId);
      toast({
        title: "Success",
        description: "Role removed successfully"
      });
      await loadData();
      await refreshUserRoles();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove role",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      guardian_id: '',
      role: 'parent' as UserRole,
      team_id: undefined
    });
    setEditingRole(null);
  };

  const openEditDialog = (role: UserRoleData) => {
    setEditingRole(role);
    setFormData({
      guardian_id: role.guardian_id,
      role: role.role,
      team_id: role.team_id
    });
    setDialogOpen(true);
  };

  const openCreateDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return <Crown className="h-4 w-4" />;
      case 'coach':
        return <Shield className="h-4 w-4" />;
      case 'manager':
        return <Users className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return "bg-destructive text-destructive-foreground";
      case 'coach':
        return "bg-primary text-primary-foreground";
      case 'manager':
        return "bg-secondary text-secondary-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  if (loading && userRoles.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <p className="text-muted-foreground">Loading roles...</p>
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
              Role Management
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Manage user roles and permissions
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog}>
                <Plus className="mr-2 h-4 w-4" />
                Add Role
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingRole ? 'Edit Role' : 'Assign New Role'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="guardian">User</Label>
                  <Select
                    value={formData.guardian_id}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, guardian_id: value }))}
                    disabled={!!editingRole}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a user" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableGuardians.map((guardian) => (
                        <SelectItem key={guardian.id} value={guardian.id}>
                          {guardian.first_name} {guardian.last_name} ({guardian.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, role: value as UserRole }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="parent">Parent</SelectItem>
                      <SelectItem value="coach">Coach</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {(formData.role === 'coach' || formData.role === 'manager') && (
                  <div className="space-y-2">
                    <Label htmlFor="team">Team (Optional)</Label>
                    <Select
                      value={formData.team_id || ''}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, team_id: value || undefined }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a team (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Teams</SelectItem>
                        {availableTeams.map((team) => (
                          <SelectItem key={team.id} value={team.id}>
                            {team.name} ({team.age_group})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={editingRole ? handleUpdateRole : handleCreateRole} disabled={loading}>
                    {editingRole ? 'Update Role' : 'Assign Role'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {userRoles.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No roles assigned yet. Click "Add Role" to get started.
            </p>
          ) : (
            userRoles.map((userRole) => (
              <div key={userRole.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {getRoleIcon(userRole.role)}
                    <div>
                      <p className="font-medium">
                        {userRole.guardians?.first_name} {userRole.guardians?.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground">{userRole.guardians?.email}</p>
                    </div>
                  </div>
                  <Badge className={getRoleColor(userRole.role)}>
                    {userRole.role}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {userRole.teams?.name ? `${userRole.teams.name} (${userRole.teams.age_group})` : 'All Teams'}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEditDialog(userRole)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={() => handleDeleteRole(userRole.id)}
                    disabled={loading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};