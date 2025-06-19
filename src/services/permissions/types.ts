
export interface Permission {
  id: string;
  name: string;
  description?: string;
  category: string;
  created_at: string;
}

export interface RolePermission {
  id: string;
  role: string;
  permission_id: string;
  created_at: string;
}

export type PermissionName = 
  // Team permissions
  | 'teams.view.all'
  | 'teams.view.assigned'
  | 'teams.view.children'
  | 'teams.create'
  | 'teams.edit.all'
  | 'teams.edit.assigned'
  | 'teams.delete'
  // Event permissions
  | 'events.view.all'
  | 'events.view.assigned'
  | 'events.view.children'
  | 'events.create'
  | 'events.edit.all'
  | 'events.edit.assigned'
  | 'events.delete'
  // User management permissions
  | 'users.view.all'
  | 'users.edit.all'
  | 'users.delete'
  | 'roles.assign'
  | 'roles.manage'
  // Group permissions
  | 'groups.view.all'
  | 'groups.create'
  | 'groups.edit.all'
  | 'groups.delete'
  // Analytics permissions
  | 'analytics.view.all'
  | 'analytics.view.assigned'
  // System permissions
  | 'settings.manage'
  | 'approvals.manage';

export interface UserPermissions {
  permissions: PermissionName[];
  accessibleTeams: string[];
  hasPermission: (permission: PermissionName) => boolean;
  canAccessTeam: (teamId: string) => boolean;
}
