import { useState, useEffect } from 'react';
import { supabaseRoleApi, supabaseUserApi, supabaseTeamApi } from '@/services/supabaseApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { UserRole, User, Team } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Shield, Users, AlertTriangle, Trash2 } from 'lucide-react';
import { logger } from '@/utils/logger';

export function RoleManagement() {
  const { currentUser, hasRole } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [userRoles, setUserRoles] = useState<{ [userId: string]: { role: string; teamId?: string; isActive: boolean }[] }>({});
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('parent');
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Only admins can access role management
  if (!hasRole('admin')) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>You don't have permission to manage roles.</AlertDescription>
      </Alert>
    );
  }

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersData, teamsData] = await Promise.all([
        supabaseUserApi.getAll(),
        supabaseTeamApi.getAll()
      ]);
      
      setUsers(usersData);
      setTeams(teamsData);

      // Load role assignments for each user
      const roleAssignments: { [userId: string]: { role: string; teamId?: string; isActive: boolean }[] } = {};
      for (const user of usersData) {
        try {
          const roles = await supabaseRoleApi.getUserRoles(user.id);
          roleAssignments[user.id] = roles;
        } catch (error) {
          logger.error(`Error loading roles for user ${user.id}:`, error);
          roleAssignments[user.id] = [];
        }
      }
      setUserRoles(roleAssignments);
    } catch (error) {
      logger.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignRole = async () => {
    if (!selectedUser || !selectedRole) {
      toast.error('Please select a user and role');
      return;
    }

    if ((selectedRole === 'coach' || selectedRole === 'manager') && !selectedTeam) {
      toast.error('Please select a team for coach/manager roles');
      return;
    }

    try {
      await supabaseRoleApi.assignRole(
        selectedUser, 
        selectedRole, 
        (selectedRole === 'coach' || selectedRole === 'manager') ? selectedTeam : undefined
      );
      
      toast.success('Role assigned successfully');
      
      // Reset form
      setSelectedUser('');
      setSelectedRole('parent');
      setSelectedTeam('');
      
      // Reload data
      await loadData();
    } catch (error) {
      logger.error('Error assigning role:', error);
      toast.error('Failed to assign role');
    }
  };

  const handleRemoveRole = async (userId: string, role: UserRole, teamId?: string) => {
    try {
      await supabaseRoleApi.removeRole(userId, role, teamId);
      toast.success('Role removed successfully');
      
      // Reload data
      await loadData();
    } catch (error) {
      logger.error('Error removing role:', error);
      toast.error('Failed to remove role');
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return "bg-red-100 text-red-800 border-red-200";
      case 'coach':
        return "bg-blue-100 text-blue-800 border-blue-200";
      case 'manager':
        return "bg-green-100 text-green-800 border-green-200";
      case 'parent':
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getTeamName = (teamId: string) => {
    const team = teams.find(t => t.id === teamId);
    return team ? `${team.name} (${team.ageGroup})` : teamId;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Loading role management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Role Assignment Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Assign Role
          </CardTitle>
          <CardDescription>
            Assign roles to users. Coaches and managers must be linked to specific teams.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">User</label>
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger>
                  <SelectValue placeholder="Select user" />
                </SelectTrigger>
                <SelectContent>
                  {users.map(user => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Role</label>
              <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as UserRole)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="parent">Parent</SelectItem>
                  <SelectItem value="coach">Coach</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(selectedRole === 'coach' || selectedRole === 'manager') && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Team</label>
                <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select team" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map(team => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name} ({team.ageGroup})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <Button onClick={handleAssignRole} className="w-full md:w-auto">
            <Shield className="h-4 w-4 mr-2" />
            Assign Role
          </Button>
        </CardContent>
      </Card>

      {/* Current Role Assignments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Current Role Assignments
          </CardTitle>
          <CardDescription>
            View and manage existing role assignments for all users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map(user => {
              const roles = userRoles[user.id] || [];
              const activeRoles = roles.filter(r => r.isActive);
              
              return (
                <div key={user.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{user.name}</h3>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {activeRoles.length > 0 ? (
                        activeRoles.map((roleAssignment, index) => (
                          <div key={index} className="flex items-center">
                            <Badge 
                              className={`${getRoleBadgeColor(roleAssignment.role)} flex items-center gap-1`}
                            >
                              {roleAssignment.role.charAt(0).toUpperCase() + roleAssignment.role.slice(1)}
                              {roleAssignment.teamId && (
                                <span className="text-xs opacity-75">
                                  • {getTeamName(roleAssignment.teamId)}
                                </span>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-4 w-4 p-0 ml-1 hover:bg-destructive hover:text-destructive-foreground"
                                onClick={() => handleRemoveRole(user.id, roleAssignment.role as UserRole, roleAssignment.teamId)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </Badge>
                          </div>
                        ))
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">
                          No roles assigned
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {activeRoles.length > 0 && (
                    <div className="text-xs text-muted-foreground">
                      <strong>Permissions:</strong> {' '}
                      {activeRoles.map(r => {
                        switch (r.role) {
                          case 'admin':
                            return 'Full system access';
                          case 'coach':
                            return `Coach access for ${r.teamId ? getTeamName(r.teamId) : 'all teams'}`;
                          case 'manager':
                            return `Manager access for ${r.teamId ? getTeamName(r.teamId) : 'all teams'}`;
                          case 'parent':
                            return 'Parent access to own children';
                          default:
                            return 'Limited access';
                        }
                      }).join(', ')}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {users.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No users found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Role Permissions Info */}
      <Card>
        <CardHeader>
          <CardTitle>Role Permissions</CardTitle>
          <CardDescription>Understanding different role permissions in the system</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="p-3 border rounded-lg">
                <Badge className={getRoleBadgeColor('admin')} variant="outline">Admin</Badge>
                <p className="text-sm mt-2">Full system access including user management, approvals, and all team data.</p>
              </div>
              
              <div className="p-3 border rounded-lg">
                <Badge className={getRoleBadgeColor('coach')} variant="outline">Coach</Badge>
                <p className="text-sm mt-2">Access to assigned team(s) data, player management, and event scheduling.</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="p-3 border rounded-lg">
                <Badge className={getRoleBadgeColor('manager')} variant="outline">Manager</Badge>
                <p className="text-sm mt-2">Team administrative access, approvals for assigned teams, and player registration.</p>
              </div>
              
              <div className="p-3 border rounded-lg">
                <Badge className={getRoleBadgeColor('parent')} variant="outline">Parent</Badge>
                <p className="text-sm mt-2">Access to own children's profiles, events, and club information.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}