import { db } from './database';
import { supabaseChildrenApi, supabaseTeamApi, supabaseUserApi } from './supabaseApi';
import { Child, Team, User } from '@/types';
import { syncService } from './syncService';

/**
 * Offline-first API that works with IndexedDB and syncs with Supabase
 */

// Generate unique IDs for offline-created items
const generateOfflineId = () => `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const offlineChildrenApi = {
  getAll: async (): Promise<Child[]> => {
    try {
      // Try to get from local database first
      const localChildren = await db.children.toArray();
      
      // If online and we have data, trigger background sync
      if (navigator.onLine && localChildren.length === 0) {
        try {
          const remoteChildren = await supabaseChildrenApi.getAll();
          // Store in local database
          for (const child of remoteChildren) {
            await db.children.put({
              ...child,
              lastModified: new Date(),
              syncStatus: 'synced'
            });
          }
          return remoteChildren;
        } catch (error) {
          console.error('Failed to fetch from remote, using local data:', error);
        }
      }
      
      // Return local data (excluding sync metadata)
      return localChildren.map(({ lastModified, syncStatus, ...child }) => child);
    } catch (error) {
      console.error('Error getting children:', error);
      return [];
    }
  },

  getById: async (id: string): Promise<Child | undefined> => {
    try {
      const localChild = await db.children.get(id);
      if (localChild) {
        const { lastModified, syncStatus, ...child } = localChild;
        return child;
      }

      // If not found locally and online, try remote
      if (navigator.onLine) {
        const remoteChild = await supabaseChildrenApi.getById(id);
        if (remoteChild) {
          await db.children.put({
            ...remoteChild,
            lastModified: new Date(),
            syncStatus: 'synced'
          });
          return remoteChild;
        }
      }

      return undefined;
    } catch (error) {
      console.error('Error getting child by ID:', error);
      return undefined;
    }
  },

  getByTeamId: async (teamId: string): Promise<Child[]> => {
    try {
      const localChildren = await db.children.where('teamId').equals(teamId).toArray();
      
      // If online, ensure we have latest data
      if (navigator.onLine && localChildren.length === 0) {
        try {
          const remoteChildren = await supabaseChildrenApi.getByTeamId(teamId);
          for (const child of remoteChildren) {
            await db.children.put({
              ...child,
              lastModified: new Date(),
              syncStatus: 'synced'
            });
          }
          return remoteChildren;
        } catch (error) {
          console.error('Failed to fetch team children from remote:', error);
        }
      }
      
      return localChildren.map(({ lastModified, syncStatus, ...child }) => child);
    } catch (error) {
      console.error('Error getting children by team ID:', error);
      return [];
    }
  },

  create: async (child: Omit<Child, 'id'>): Promise<Child> => {
    try {
      const newChild: Child = {
        ...child,
        id: generateOfflineId()
      };

      // Store locally first
      await db.children.put({
        ...newChild,
        lastModified: new Date(),
        syncStatus: 'pending'
      });

      // If online, try to sync immediately
      if (navigator.onLine) {
        syncService.performFullSync().catch(console.error);
      }

      return newChild;
    } catch (error) {
      console.error('Error creating child:', error);
      throw error;
    }
  },

  update: async (id: string, updates: Partial<Child>): Promise<Child | undefined> => {
    try {
      const existingChild = await db.children.get(id);
      if (!existingChild) return undefined;

      const updatedChild = {
        ...existingChild,
        ...updates,
        lastModified: new Date(),
        syncStatus: 'pending' as const
      };

      await db.children.put(updatedChild);

      // If online, try to sync immediately
      if (navigator.onLine) {
        syncService.performFullSync().catch(console.error);
      }

      const { lastModified, syncStatus, ...child } = updatedChild;
      return child;
    } catch (error) {
      console.error('Error updating child:', error);
      throw error;
    }
  }
};

export const offlineTeamApi = {
  getAll: async (): Promise<Team[]> => {
    try {
      const localTeams = await db.teams.toArray();
      
      if (navigator.onLine && localTeams.length === 0) {
        try {
          const remoteTeams = await supabaseTeamApi.getAll();
          for (const team of remoteTeams) {
            await db.teams.put({
              ...team,
              lastModified: new Date(),
              syncStatus: 'synced'
            });
          }
          return remoteTeams;
        } catch (error) {
          console.error('Failed to fetch teams from remote:', error);
        }
      }
      
      return localTeams.map(({ lastModified, syncStatus, ...team }) => team);
    } catch (error) {
      console.error('Error getting teams:', error);
      return [];
    }
  },

  getById: async (id: string): Promise<Team | undefined> => {
    try {
      const localTeam = await db.teams.get(id);
      if (localTeam) {
        const { lastModified, syncStatus, ...team } = localTeam;
        return team;
      }

      if (navigator.onLine) {
        const remoteTeam = await supabaseTeamApi.getById(id);
        if (remoteTeam) {
          await db.teams.put({
            ...remoteTeam,
            lastModified: new Date(),
            syncStatus: 'synced'
          });
          return remoteTeam;
        }
      }

      return undefined;
    } catch (error) {
      console.error('Error getting team by ID:', error);
      return undefined;
    }
  },

  create: async (team: Omit<Team, 'id'>): Promise<Team> => {
    try {
      const newTeam: Team = {
        ...team,
        id: generateOfflineId()
      };

      await db.teams.put({
        ...newTeam,
        lastModified: new Date(),
        syncStatus: 'pending'
      });

      if (navigator.onLine) {
        syncService.performFullSync().catch(console.error);
      }

      return newTeam;
    } catch (error) {
      console.error('Error creating team:', error);
      throw error;
    }
  }
};

export const offlineUserApi = {
  getAll: async (): Promise<User[]> => {
    try {
      const localUsers = await db.users.toArray();
      
      if (navigator.onLine && localUsers.length === 0) {
        try {
          const remoteUsers = await supabaseUserApi.getAll();
          for (const user of remoteUsers) {
            await db.users.put({
              ...user,
              lastModified: new Date(),
              syncStatus: 'synced'
            });
          }
          return remoteUsers;
        } catch (error) {
          console.error('Failed to fetch users from remote:', error);
        }
      }
      
      return localUsers.map(({ lastModified, syncStatus, ...user }) => ({
        ...user,
        roles: user.roles as any
      }));
    } catch (error) {
      console.error('Error getting users:', error);
      return [];
    }
  },

  getById: async (id: string): Promise<User | undefined> => {
    try {
      const localUser = await db.users.get(id);
      if (localUser) {
        const { lastModified, syncStatus, ...user } = localUser;
        return { ...user, roles: user.roles as any };
      }

      if (navigator.onLine) {
        const remoteUser = await supabaseUserApi.getById(id);
        if (remoteUser) {
          await db.users.put({
            ...remoteUser,
            lastModified: new Date(),
            syncStatus: 'synced'
          });
          return remoteUser;
        }
      }

      return undefined;
    } catch (error) {
      console.error('Error getting user by ID:', error);
      return undefined;
    }
  },

  getByEmail: async (email: string): Promise<User | undefined> => {
    try {
      const localUser = await db.users.where('email').equals(email).first();
      if (localUser) {
        const { lastModified, syncStatus, ...user } = localUser;
        return { ...user, roles: user.roles as any };
      }

      if (navigator.onLine) {
        const remoteUser = await supabaseUserApi.getByEmail(email);
        if (remoteUser) {
          await db.users.put({
            ...remoteUser,
            lastModified: new Date(),
            syncStatus: 'synced'
          });
          return remoteUser;
        }
      }

      return undefined;
    } catch (error) {
      console.error('Error getting user by email:', error);
      return undefined;
    }
  }
};