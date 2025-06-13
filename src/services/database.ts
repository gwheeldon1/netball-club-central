import Dexie, { Table } from 'dexie';

// Simplified database interfaces to avoid circular references
export interface DbChild {
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
  lastModified: Date;
  syncStatus: 'synced' | 'pending' | 'conflict';
}

export interface DbTeam {
  id: string;
  name: string;
  ageGroup: string;
  category: 'Junior' | 'Senior' | 'Mixed';
  profileImage?: string;
  bannerImage?: string;
  icon?: string;
  description?: string;
  lastModified: Date;
  syncStatus: 'synced' | 'pending' | 'conflict';
}

export interface DbUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  profileImage?: string;
  roles: string[];
  lastModified: Date;
  syncStatus: 'synced' | 'pending' | 'conflict';
}

export interface DbEvent {
  id: string;
  name: string;
  date: string;
  time: string;
  location: string;
  notes?: string;
  eventType: 'training' | 'match' | 'other';
  teamId: string;
  recurring?: boolean;
  recurrencePattern?: string;
  opponent?: string;
  lastModified: Date;
  syncStatus: 'synced' | 'pending' | 'conflict';
}

export interface DbAttendance {
  childId: string;
  eventId: string;
  status: 'present' | 'absent' | 'injured' | 'late';
  rsvp: 'going' | 'not_going' | 'maybe';
  lastModified: Date;
  syncStatus: 'synced' | 'pending' | 'conflict';
}

export interface SyncMetadata {
  table: string;
  lastSyncTime: Date;
  conflictResolution?: 'local' | 'remote' | 'manual';
}

export class NetballDatabase extends Dexie {
  children!: Table<DbChild>;
  teams!: Table<DbTeam>;
  users!: Table<DbUser>;
  events!: Table<DbEvent>;
  attendance!: Table<DbAttendance>;
  syncMetadata!: Table<SyncMetadata>;

  constructor() {
    super('NetballClubDB');
    
    this.version(1).stores({
      children: '++id, name, teamId, parentId, lastModified, syncStatus',
      teams: '++id, name, ageGroup, category, lastModified, syncStatus',
      users: '++id, email, name, lastModified, syncStatus',
      events: '++id, teamId, date, eventType, lastModified, syncStatus',
      attendance: '++[childId+eventId], childId, eventId, lastModified, syncStatus',
      syncMetadata: '++table, lastSyncTime'
    });

    // Add hooks for automatic lastModified timestamps
    this.children.hook('creating', (primKey, obj, trans) => {
      obj.lastModified = new Date();
      obj.syncStatus = 'pending';
    });

    this.children.hook('updating', (modifications: any) => {
      modifications.lastModified = new Date();
      modifications.syncStatus = 'pending';
    });

    this.teams.hook('creating', (primKey, obj, trans) => {
      obj.lastModified = new Date();
      obj.syncStatus = 'pending';
    });

    this.teams.hook('updating', (modifications: any) => {
      modifications.lastModified = new Date();
      modifications.syncStatus = 'pending';
    });

    this.users.hook('creating', (primKey, obj, trans) => {
      obj.lastModified = new Date();
      obj.syncStatus = 'pending';
    });

    this.users.hook('updating', (modifications: any) => {
      modifications.lastModified = new Date();
      modifications.syncStatus = 'pending';
    });

    this.events.hook('creating', (primKey, obj, trans) => {
      obj.lastModified = new Date();
      obj.syncStatus = 'pending';
    });

    this.events.hook('updating', (modifications: any) => {
      modifications.lastModified = new Date();
      modifications.syncStatus = 'pending';
    });

    this.attendance.hook('creating', (primKey, obj, trans) => {
      obj.lastModified = new Date();
      obj.syncStatus = 'pending';
    });

    this.attendance.hook('updating', (modifications: any) => {
      modifications.lastModified = new Date();
      modifications.syncStatus = 'pending';
    });
  }

  // Helper methods for common operations
  async markAsSynced(table: string, id: string) {
    switch (table) {
      case 'children':
        await this.children.update(id, { syncStatus: 'synced' });
        break;
      case 'teams':
        await this.teams.update(id, { syncStatus: 'synced' });
        break;
      case 'users':
        await this.users.update(id, { syncStatus: 'synced' });
        break;
      case 'events':
        await this.events.update(id, { syncStatus: 'synced' });
        break;
      case 'attendance':
        await this.attendance.update(id, { syncStatus: 'synced' });
        break;
    }
  }

  async getPendingSync(table: string) {
    switch (table) {
      case 'children':
        return await this.children.where('syncStatus').equals('pending').toArray();
      case 'teams':
        return await this.teams.where('syncStatus').equals('pending').toArray();
      case 'users':
        return await this.users.where('syncStatus').equals('pending').toArray();
      case 'events':
        return await this.events.where('syncStatus').equals('pending').toArray();
      case 'attendance':
        return await this.attendance.where('syncStatus').equals('pending').toArray();
      default:
        return [];
    }
  }

  async updateSyncMetadata(table: string) {
    await this.syncMetadata.put({
      table,
      lastSyncTime: new Date()
    });
  }

  async getLastSyncTime(table: string): Promise<Date | null> {
    const metadata = await this.syncMetadata.where('table').equals(table).first();
    return metadata?.lastSyncTime || null;
  }
}

export const db = new NetballDatabase();