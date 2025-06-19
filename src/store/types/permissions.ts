
// Type-safe permission definitions
export enum PermissionCategory {
  TEAMS = 'teams',
  EVENTS = 'events',
  USERS = 'users',
  GROUPS = 'groups',
  ANALYTICS = 'analytics',
  SYSTEM = 'system',
  ROLES = 'roles',
}

export enum TeamPermission {
  VIEW_ALL = 'teams.view.all',
  VIEW_ASSIGNED = 'teams.view.assigned',
  VIEW_CHILDREN = 'teams.view.children',
  CREATE = 'teams.create',
  EDIT_ALL = 'teams.edit.all',
  EDIT_ASSIGNED = 'teams.edit.assigned',
  DELETE = 'teams.delete',
}

export enum EventPermission {
  VIEW_ALL = 'events.view.all',
  VIEW_ASSIGNED = 'events.view.assigned',
  VIEW_CHILDREN = 'events.view.children',
  CREATE = 'events.create',
  EDIT_ALL = 'events.edit.all',
  EDIT_ASSIGNED = 'events.edit.assigned',
  DELETE = 'events.delete',
}

export enum UserPermission {
  VIEW_ALL = 'users.view.all',
  EDIT_ALL = 'users.edit.all',
  DELETE = 'users.delete',
}

export enum RolePermission {
  ASSIGN = 'roles.assign',
  MANAGE = 'roles.manage',
}

export enum SystemPermission {
  SETTINGS_MANAGE = 'settings.manage',
  APPROVALS_MANAGE = 'approvals.manage',
}

export enum GroupPermission {
  VIEW_ALL = 'groups.view.all',
  CREATE = 'groups.create',
  EDIT_ALL = 'groups.edit.all',
  DELETE = 'groups.delete',
}

export enum AnalyticsPermission {
  VIEW_ALL = 'analytics.view.all',
  VIEW_ASSIGNED = 'analytics.view.assigned',
}

export type Permission = 
  | TeamPermission 
  | EventPermission 
  | UserPermission 
  | RolePermission 
  | SystemPermission 
  | GroupPermission 
  | AnalyticsPermission;

export interface PermissionContext {
  teamId?: string;
  eventId?: string;
  userId?: string;
  timestamp?: number;
}

export interface UserPermissions {
  permissions: Permission[];
  accessibleTeams: string[];
  roles: string[];
  context?: PermissionContext;
  lastUpdated: number;
  expiresAt: number;
}

export interface PermissionCheck {
  permission: Permission;
  context?: PermissionContext;
  result: boolean;
  reason?: string;
  timestamp: number;
}

export interface PermissionAuditLog {
  id: string;
  userId: string;
  action: 'check' | 'grant' | 'revoke' | 'escalate';
  permission: Permission;
  context?: PermissionContext;
  result: boolean;
  timestamp: number;
  metadata?: Record<string, any>;
}
