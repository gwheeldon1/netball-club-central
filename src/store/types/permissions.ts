
// Simple permission type definitions
export type Permission = string;

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

// Permission constants
export const TeamPermission = {
  VIEW_ALL: 'teams.view.all',
  VIEW_ASSIGNED: 'teams.view.assigned',
  VIEW_CHILDREN: 'teams.view.children',
  CREATE: 'teams.create',
  EDIT_ALL: 'teams.edit.all',
  EDIT_ASSIGNED: 'teams.edit.assigned',
  DELETE: 'teams.delete',
} as const;

export const EventPermission = {
  VIEW_ALL: 'events.view.all',
  VIEW_ASSIGNED: 'events.view.assigned',
  VIEW_CHILDREN: 'events.view.children',
  CREATE: 'events.create',
  EDIT_ALL: 'events.edit.all',
  EDIT_ASSIGNED: 'events.edit.assigned',
  DELETE: 'events.delete',
} as const;
