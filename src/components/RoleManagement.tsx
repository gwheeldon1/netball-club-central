import { useState, useEffect } from 'react';
import { supabaseRoleApi, supabaseUserApi, supabaseTeamApi } from '@/services/supabaseApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { UserRole, User, Team } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

export function RoleManagement() {
  const { currentUser, hasRole } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('parent');
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Only admins can access role management
  if (!hasRole('admin')) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Access Denied</CardTitle>
          <CardDescription>You don't have permission to manage roles.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  useEffect(() => {
    const loadData = async () => {
      try {
        const [usersData, teamsData] = await Promise.all([
          supabaseUserApi.getAll(),
          supabaseTeamApi.getAll()
        ]);
        setUsers(usersData);
        setTeams(teamsData);
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleAssignRole = async () => {
    if (!selectedUser || !selectedRole) {
      toast.error('Please select a user and role');
      return;
    }

    try {
      await supabaseRoleApi.assignRole(
        selectedUser, 
        selectedRole, 
        (selectedRole === 'coach' || selectedRole === 'manager') ? selectedTeam : undefined
      );
      
      toast.success('Role assigned successfully');
      
      // Refresh users data
      const updatedUsers = await supabaseUserApi.getAll();
      setUsers(updatedUsers);
      
      // Reset form
      setSelectedUser('');
      setSelectedRole('parent');
      setSelectedTeam('');
    } catch (error) {
      console.error('Error assigning role:', error);
      toast.error('Failed to assign role');
    }
  };

  const handleRemoveRole = async (userId: string, role: UserRole, teamId?: string) => {
    try {
      await supabaseRoleApi.removeRole(userId, role, teamId);
      toast.success('Role removed successfully');
      
      // Refresh users data
      const updatedUsers = await supabaseUserApi.getAll();
      setUsers(updatedUsers);
    } catch (error) {
      console.error('Error removing role:', error);
      toast.error('Failed to remove role');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Assign Role</CardTitle>
          <CardDescription>Assign roles to users in the club</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
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

            <div>
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
              <div>
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
            Assign Role
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Current Role Assignments</CardTitle>
          <CardDescription>View and manage existing role assignments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map(user => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-semibold">{user.name}</h3>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {user.roles.map(role => (
                    <Badge key={role} variant="secondary" className="flex items-center gap-1">
                      {role}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => handleRemoveRole(user.id, role)}
                      >
                        ×
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}