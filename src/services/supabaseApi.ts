// Temporary placeholder - use unified API instead
import { api } from './unifiedApi';
import { User, Child, Team, UserRole } from '@/types';

// Re-export unified API functions with old names for backward compatibility
export const supabaseChildrenApi = {
  getAll: async (): Promise<Child[]> => api.getChildren(),
  getById: async (id: string): Promise<Child | undefined> => {
    const children = await api.getChildren();
    return children.find(c => c.id === id);
  },
  getByTeamId: async (teamId: string): Promise<Child[]> => api.getChildrenByTeamId(teamId),
  getByParentId: async (parentId: string): Promise<Child[]> => {
    const children = await api.getChildren();
    return children.filter(c => c.parentId === parentId);
  },
  create: async (child: Omit<Child, 'id'>): Promise<Child> => {
    // This needs proper implementation - placeholder for now
    return { ...child, id: 'temp-id' } as Child;
  },
  update: async (id: string, updates: Partial<Child>): Promise<Child | undefined> => {
    // This needs proper implementation - placeholder for now
    return undefined;
  },
};

export const supabaseTeamApi = {
  getAll: async (): Promise<Team[]> => api.getTeams(),
  getById: async (id: string): Promise<Team | undefined> => api.getTeamById(id),
  create: async (team: Omit<Team, 'id'>): Promise<Team> => api.createTeam(team),
  update: async (id: string, updates: Partial<Team>): Promise<Team | undefined> => {
    // This needs proper implementation - placeholder for now
    return undefined;
  },
  delete: async (id: string): Promise<void> => {
    // This needs proper implementation - placeholder for now
    return Promise.resolve();
  },
};

export const supabaseUserApi = {
  getAll: async (): Promise<User[]> => api.getUsers(),
  getById: async (id: string): Promise<User | undefined> => api.getUserById(id),
  getByEmail: async (email: string): Promise<User | undefined> => {
    const users = await api.getUsers();
    return users.find(u => u.email === email);
  },
  getCurrentUser: async (): Promise<User | undefined> => {
    // This needs proper implementation with auth context
    return undefined;
  },
  create: async (user: Omit<User, 'id'>): Promise<User> => api.createUser(user),
  update: async (id: string, updates: Partial<User>): Promise<User | undefined> => {
    // This needs proper implementation - placeholder for now
    return undefined;
  },
  delete: async (id: string): Promise<void> => {
    // This needs proper implementation - placeholder for now
    return Promise.resolve();
  },
};

export const supabaseRoleApi = {
  assignRole: async (userId: string, role: UserRole, teamId?: string): Promise<void> => {
    // This needs proper implementation - placeholder for now
    return Promise.resolve();
  },
  removeRole: async (userId: string, role: UserRole, teamId?: string): Promise<void> => {
    // This needs proper implementation - placeholder for now
    return Promise.resolve();
  },
  getUserRoles: async (userId: string): Promise<{ role: string; teamId?: string; isActive: boolean; }[]> => {
    const user = await api.getUserById(userId);
    return user?.roles.map(role => ({ role, isActive: true })) || [];
  },
  hasRole: async (userId: string, role: UserRole): Promise<boolean> => {
    const user = await api.getUserById(userId);
    return user?.roles.includes(role) || false;
  },
};