// Wrapper API that uses IndexedDB as primary store with sync capabilities
import { offlineApi as dbApi } from './database';
import { syncService } from './syncService';
import { User, Child, Team, Event, Attendance, UserRole } from '@/types';

class OfflineFirstAPI {
  // Users
  async getUsers(): Promise<User[]> {
    const dbUsers = await dbApi.getUsers();
    return dbUsers.map(dbUser => ({
      ...dbUser,
      roles: dbUser.roles as UserRole[]
    }));
  }

  async getUserById(id: string): Promise<User | undefined> {
    const dbUser = await dbApi.getUserById(id);
    if (!dbUser) return undefined;
    return {
      ...dbUser,
      roles: dbUser.roles as UserRole[]
    };
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const dbUser = await dbApi.getUserByEmail(email);
    if (!dbUser) return undefined;
    return {
      ...dbUser,
      roles: dbUser.roles as UserRole[]
    };
  }

  async createUser(user: Omit<User, 'id'>): Promise<User> {
    const dbUser = {
      ...user,
      roles: user.roles as string[]
    };
    const newUser = await dbApi.createUser(dbUser as any);
    return {
      ...newUser,
      roles: newUser.roles as UserRole[]
    };
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const dbUpdates = {
      ...updates,
      roles: updates.roles ? updates.roles as string[] : undefined
    };
    const updatedUser = await dbApi.updateUser(id, dbUpdates as any);
    if (!updatedUser) return undefined;
    return {
      ...updatedUser,
      roles: updatedUser.roles as UserRole[]
    };
  }

  // Children - direct pass-through since types match
  async getChildren(): Promise<Child[]> {
    return await dbApi.getChildren();
  }

  async getChildById(id: string): Promise<Child | undefined> {
    return await dbApi.getChildById(id);
  }

  async getChildrenByParentId(parentId: string): Promise<Child[]> {
    return await dbApi.getChildrenByParentId(parentId);
  }

  async getChildrenByTeamId(teamId: string): Promise<Child[]> {
    return await dbApi.getChildrenByTeamId(teamId);
  }

  async createChild(child: Omit<Child, 'id'>): Promise<Child> {
    return await dbApi.createChild(child);
  }

  async updateChild(id: string, updates: Partial<Child>): Promise<Child | undefined> {
    return await dbApi.updateChild(id, updates);
  }

  async deleteChild(id: string): Promise<void> {
    return await dbApi.deleteChild(id);
  }

  // Teams - direct pass-through since types match
  async getTeams(): Promise<Team[]> {
    return await dbApi.getTeams();
  }

  async getTeamById(id: string): Promise<Team | undefined> {
    return await dbApi.getTeamById(id);
  }

  async createTeam(team: Omit<Team, 'id'>): Promise<Team> {
    return await dbApi.createTeam(team);
  }

  async updateTeam(id: string, updates: Partial<Team>): Promise<Team | undefined> {
    return await dbApi.updateTeam(id, updates);
  }

  async deleteTeam(id: string): Promise<void> {
    return await dbApi.deleteTeam(id);
  }

  // Events - direct pass-through since types match
  async getEvents(): Promise<Event[]> {
    return await dbApi.getEvents();
  }

  async getEventById(id: string): Promise<Event | undefined> {
    return await dbApi.getEventById(id);
  }

  async getEventsByTeamId(teamId: string): Promise<Event[]> {
    return await dbApi.getEventsByTeamId(teamId);
  }

  async createEvent(event: Omit<Event, 'id'>): Promise<Event> {
    return await dbApi.createEvent(event);
  }

  async updateEvent(id: string, updates: Partial<Event>): Promise<Event | undefined> {
    return await dbApi.updateEvent(id, updates);
  }

  async deleteEvent(id: string): Promise<void> {
    return await dbApi.deleteEvent(id);
  }

  // Attendance - direct pass-through since types match
  async getAttendance(): Promise<Attendance[]> {
    return await dbApi.getAttendance();
  }

  async getAttendanceByEventId(eventId: string): Promise<Attendance[]> {
    return await dbApi.getAttendanceByEventId(eventId);
  }

  async getAttendanceByChildId(childId: string): Promise<Attendance[]> {
    return await dbApi.getAttendanceByChildId(childId);
  }

  async updateAttendance(childId: string, eventId: string, updates: Partial<Attendance>): Promise<void> {
    return await dbApi.updateAttendance(childId, eventId, updates);
  }

  // Sync utilities
  async forceSync(): Promise<void> {
    return await syncService.forceSync();
  }

  getOnlineStatus(): boolean {
    return syncService.getOnlineStatus();
  }

  getSyncStatus(): boolean {
    return syncService.getSyncStatus();
  }
}

export const api = new OfflineFirstAPI();