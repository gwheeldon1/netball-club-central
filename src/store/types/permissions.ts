
// Simplified permission types
export type Permission = 
  | 'teams.view.all'
  | 'teams.view.children'
  | 'teams.create'
  | 'teams.edit'
  | 'teams.delete'
  | 'events.view.all'
  | 'events.create'
  | 'events.edit'
  | 'events.delete'
  | 'children.view.all'
  | 'children.create'
  | 'children.edit'
  | 'approvals.manage'
  | 'users.manage'
  | 'settings.manage';

export type TeamPermission = Permission;

export interface UserPermissions {
  permissions: Permission[];
  accessibleTeams: string[];
  roles: string[];
  lastUpdated: number;
  expiresAt: number;
}
