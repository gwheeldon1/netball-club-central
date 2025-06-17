import Dexie, { Table } from 'dexie';
import { User, UserRole, Child, Team, Event, Attendance } from '@/types/unified'; // Added User, UserRole

// Database types for offline storage
interface DBUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  profileImage?: string;
  roles: string[];
}

interface DBChild {
  id: string;
  name: string;
  dateOfBirth: string;
  medicalInfo?: string;
  notes?: string;
  profileImage?: string;
  teamId?: string;
  ageGroup?: string;
  parentId: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface DBTeam {
  id: string;
  name: string;
  ageGroup: string;
  category: 'Junior' | 'Senior' | 'Mixed';
  profileImage?: string;
  bannerImage?: string;
  icon?: string;
  description?: string;
}

interface DBEvent {
  id: string;
  name: string;
  date: string;
  time: string;
  location: string;
  notes?: string;
  description?: string;
  eventType: 'training' | 'match' | 'social' | 'meeting' | 'other';
  teamId: string;
  recurring?: boolean;
  recurrencePattern?: string;
  opponent?: string;
  isHome?: boolean;
  requiresRSVP?: boolean;
}

interface DBAttendance {
  childId: string;
  eventId: string;
  status: 'present' | 'absent' | 'injured' | 'late';
  rsvp: 'going' | 'not_going' | 'maybe';
}

export interface SyncStatus {
  id: string;
  tableName: string;
  recordId: string;
  action: 'create' | 'update' | 'delete';
  timestamp: number;
  synced: boolean;
  data?: Record<string, unknown>;
}

export class NetballDatabase extends Dexie {
  users!: Table<DBUser>;
  children!: Table<DBChild>;
  teams!: Table<DBTeam>;
  events!: Table<DBEvent>;
  attendance!: Table<DBAttendance>;
  syncQueue!: Table<SyncStatus>;

  constructor() {
    super('NetballDatabase');
    
    this.version(1).stores({
      users: 'id, email',
      children: 'id, parentId, teamId, status, ageGroup',
      teams: 'id, ageGroup, category',
      events: 'id, teamId, date, eventType',
      attendance: '[childId+eventId], childId, eventId',
      syncQueue: 'id, tableName, recordId, timestamp, synced',
    });
  }
}

export const db = new NetballDatabase();

// Generic CRUD operations with sync queue
export class OfflineAPI {
  private async addToSyncQueue(
    tableName: string, 
    recordId: string, 
    action: 'create' | 'update' | 'delete',
    data?: Record<string, unknown>
  ) {
    await db.syncQueue.add({
      id: `${tableName}_${recordId}_${Date.now()}`,
      tableName,
      recordId,
      action,
      timestamp: Date.now(),
      synced: false,
      data
    });
  }

  // Users
  async getUsers(): Promise<User[]> { // Return User[]
    const dbUsers = await db.users.toArray();
    return dbUsers.map(dbUser => ({
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      phone: dbUser.phone || undefined,
      profileImage: dbUser.profileImage || undefined,
      roles: dbUser.roles as UserRole[],
    }));
  }

  async getUserById(id: string): Promise<User | undefined> { // Return User | undefined
    const dbUser = await db.users.get(id);
    if (!dbUser) return undefined;
    return {
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      phone: dbUser.phone || undefined,
      profileImage: dbUser.profileImage || undefined,
      roles: dbUser.roles as UserRole[],
    };
  }

  async getUserByEmail(email: string): Promise<User | undefined> { // Return User | undefined
    const dbUser = await db.users.where('email').equals(email).first();
    if (!dbUser) return undefined;
    return {
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      phone: dbUser.phone || undefined,
      profileImage: dbUser.profileImage || undefined,
      roles: dbUser.roles as UserRole[],
    };
  }

  async createUser(user: Omit<User, 'id' | 'roles'> & { roles: string[] }): Promise<User> { // Param adjusted for DBUser like structure initially
    const dbUserToCreate: DBUser = {
      id: crypto.randomUUID(), // ID generated here
      name: user.name,
      email: user.email,
      phone: user.phone,
      profileImage: user.profileImage,
      roles: user.roles,
    };
    await db.users.add(dbUserToCreate);
    await this.addToSyncQueue('users', dbUserToCreate.id, 'create', dbUserToCreate as unknown as Record<string, unknown>);
    return {
      ...dbUserToCreate,
      roles: dbUserToCreate.roles as UserRole[], // Cast roles for return
    };
  }

  async updateUser(id: string, updates: Partial<Omit<User, 'id' | 'roles'> & { roles?: string[] }>): Promise<User | undefined> {
    // For Dexie, ensure 'roles' is string[] if provided in updates
    const dbUpdates: Partial<DBUser> = { ...updates };
    if (updates.roles) {
      dbUpdates.roles = updates.roles as string[];
    }
    await db.users.update(id, dbUpdates);
    await this.addToSyncQueue('users', id, 'update', dbUpdates as Record<string, unknown>);
    return await this.getUserById(id); // This will now return a mapped User
  }

  // Children
  async getChildren(): Promise<Child[]> {
    return await db.children.toArray();
  }

  async getChildById(id: string): Promise<Child | undefined> {
    return await db.children.get(id);
  }

  async getChildrenByParentId(parentId: string): Promise<Child[]> {
    return await db.children.where('parentId').equals(parentId).toArray();
  }

  async getChildrenByTeamId(teamId: string): Promise<Child[]> {
    return await db.children.where('teamId').equals(teamId).toArray();
  }

  async createChild(child: Omit<Child, 'id'>): Promise<Child> {
    const newChild = { ...child, id: crypto.randomUUID() };
    await db.children.add(newChild);
    await this.addToSyncQueue('children', newChild.id, 'create', newChild);
    return newChild;
  }

  async updateChild(id: string, updates: Partial<Child>): Promise<Child | undefined> {
    await db.children.update(id, updates);
    await this.addToSyncQueue('children', id, 'update', updates);
    return await this.getChildById(id);
  }

  async deleteChild(id: string): Promise<void> {
    await db.children.delete(id);
    await this.addToSyncQueue('children', id, 'delete');
  }

  // Teams
  async getTeams(): Promise<Team[]> {
    return await db.teams.toArray();
  }

  async getTeamById(id: string): Promise<Team | undefined> {
    return await db.teams.get(id);
  }

  async createTeam(team: Omit<Team, 'id'>): Promise<Team> {
    const newTeam = { ...team, id: crypto.randomUUID() };
    await db.teams.add(newTeam);
    await this.addToSyncQueue('teams', newTeam.id, 'create', newTeam);
    return newTeam;
  }

  async updateTeam(id: string, updates: Partial<Team>): Promise<Team | undefined> {
    await db.teams.update(id, updates);
    await this.addToSyncQueue('teams', id, 'update', updates);
    return await this.getTeamById(id);
  }

  async deleteTeam(id: string): Promise<void> {
    await db.teams.delete(id);
    await this.addToSyncQueue('teams', id, 'delete');
  }

  // Events
  async getEvents(): Promise<Event[]> {
    return await db.events.toArray();
  }

  async getEventById(id: string): Promise<Event | undefined> {
    return await db.events.get(id);
  }

  async getEventsByTeamId(teamId: string): Promise<Event[]> {
    return await db.events.where('teamId').equals(teamId).toArray();
  }

  async createEvent(event: Omit<Event, 'id'>): Promise<Event> {
    const newEvent = { ...event, id: crypto.randomUUID() };
    await db.events.add(newEvent);
    await this.addToSyncQueue('events', newEvent.id, 'create', newEvent);
    return newEvent;
  }

  async updateEvent(id: string, updates: Partial<Event>): Promise<Event | undefined> {
    await db.events.update(id, updates);
    await this.addToSyncQueue('events', id, 'update', updates);
    return await this.getEventById(id);
  }

  async deleteEvent(id: string): Promise<void> {
    await db.events.delete(id);
    await this.addToSyncQueue('events', id, 'delete');
  }

  // Attendance
  async getAttendance(): Promise<Attendance[]> {
    return await db.attendance.toArray();
  }

  async getAttendanceByEventId(eventId: string): Promise<Attendance[]> {
    return await db.attendance.where('eventId').equals(eventId).toArray();
  }

  async getAttendanceByChildId(childId: string): Promise<Attendance[]> {
    return await db.attendance.where('childId').equals(childId).toArray();
  }

  async updateAttendance(childId: string, eventId: string, updates: Partial<Attendance>): Promise<void> {
    const attendanceRecord: Attendance = {
      childId,
      eventId,
      status: updates.status || 'absent',
      rsvp: updates.rsvp || 'not_going'
    };
    await db.attendance.put(attendanceRecord);
    await this.addToSyncQueue('attendance', `${childId}_${eventId}`, 'update', updates);
  }

  // Sync Queue
  async getPendingSyncItems(): Promise<SyncStatus[]> {
    return await db.syncQueue.where('synced').equals(0).toArray();
  }

  async markSyncComplete(syncId: string): Promise<void> {
    await db.syncQueue.update(syncId, { synced: true });
  }

  async clearSyncQueue(): Promise<void> {
    await db.syncQueue.where('synced').equals(1).delete();
  }
}

export const offlineApi = new OfflineAPI();