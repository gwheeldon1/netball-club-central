
import { User, Child, Team, Event, Attendance, MatchStats } from '../types';

/**
 * This service centralizes all API calls for the application
 * In a real production environment, these would call your backend API
 */

// LocalStorage keys
const USERS_KEY = 'netball_users';
const CHILDREN_KEY = 'netball_children';
const TEAMS_KEY = 'netball_teams';
const EVENTS_KEY = 'netball_events';
const ATTENDANCE_KEY = 'netball_attendance';
const MATCH_STATS_KEY = 'netball_match_stats';

// Initialize local storage with default data if empty
const initializeLocalStorage = () => {
  if (!localStorage.getItem(USERS_KEY)) {
    const defaultUsers: User[] = [
      {
        id: '1',
        name: 'Sarah Johnson',
        email: 'sarah.johnson@example.com',
        phone: '07700 900123',
        profileImage: 'https://randomuser.me/api/portraits/women/42.jpg',
        roles: ['parent'],
      },
      {
        id: '2',
        name: 'James Williams',
        email: 'james.williams@example.com',
        phone: '07700 900124',
        profileImage: 'https://randomuser.me/api/portraits/men/32.jpg',
        roles: ['coach'],
      },
      {
        id: '3',
        name: 'Emma Davis',
        email: 'emma.davis@example.com',
        phone: '07700 900125',
        profileImage: 'https://randomuser.me/api/portraits/women/24.jpg',
        roles: ['manager'],
      },
      {
        id: '4',
        name: 'Michael Brown',
        email: 'michael.brown@example.com',
        phone: '07700 900126',
        profileImage: 'https://randomuser.me/api/portraits/men/45.jpg',
        roles: ['admin'],
      },
      {
        id: '5',
        name: 'Lisa Taylor',
        email: 'lisa.taylor@example.com',
        phone: '07700 900127',
        profileImage: 'https://randomuser.me/api/portraits/women/67.jpg',
        roles: ['parent', 'coach'],
      }
    ];
    localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
  }

  if (!localStorage.getItem(CHILDREN_KEY)) {
    const defaultChildren: Child[] = [
      {
        id: '1',
        name: 'Emily Johnson',
        dateOfBirth: '2012-05-15',
        medicalInfo: 'Mild asthma, carries inhaler',
        notes: 'Prefers playing Wing Defense',
        profileImage: 'https://randomuser.me/api/portraits/girls/42.jpg',
        teamId: '1',
        ageGroup: 'U12',
        parentId: '1',
        status: 'approved',
      },
      {
        id: '2',
        name: 'Sophie Johnson',
        dateOfBirth: '2014-08-22',
        medicalInfo: 'No known conditions',
        notes: 'Very enthusiastic about Goal Shooter position',
        profileImage: 'https://randomuser.me/api/portraits/girls/36.jpg',
        teamId: '2',
        ageGroup: 'U10',
        parentId: '1',
        status: 'approved',
      },
      {
        id: '3',
        name: 'Olivia Taylor',
        dateOfBirth: '2013-03-10',
        medicalInfo: 'Allergic to plasters/band-aids',
        notes: 'Strong Center Court player',
        profileImage: 'https://randomuser.me/api/portraits/girls/24.jpg',
        teamId: '1',
        ageGroup: 'U12',
        parentId: '5',
        status: 'approved',
      },
      {
        id: '4',
        name: 'Emma Wilson',
        dateOfBirth: '2016-11-05',
        medicalInfo: 'No known conditions',
        notes: 'New to netball',
        profileImage: 'https://randomuser.me/api/portraits/girls/67.jpg',
        ageGroup: 'U8',
        parentId: '5',
        status: 'pending',
      }
    ];
    localStorage.setItem(CHILDREN_KEY, JSON.stringify(defaultChildren));
  }

  if (!localStorage.getItem(TEAMS_KEY)) {
    const defaultTeams: Team[] = [
      {
        id: '1',
        name: 'Purple Panthers',
        ageGroup: 'U12',
        category: 'Junior',
        profileImage: 'https://placehold.co/400x300/9b87f5/FFFFFF?text=Purple+Panthers',
        bannerImage: 'https://placehold.co/1200x300/9b87f5/FFFFFF?text=Purple+Panthers',
        icon: 'https://placehold.co/200x200/9b87f5/FFFFFF?text=PP',
        description: 'Our competitive U12 team with focus on skill development and teamwork',
      },
      {
        id: '2',
        name: 'Shooting Stars',
        ageGroup: 'U10',
        category: 'Junior',
        profileImage: 'https://placehold.co/400x300/7E69AB/FFFFFF?text=Shooting+Stars',
        bannerImage: 'https://placehold.co/1200x300/7E69AB/FFFFFF?text=Shooting+Stars',
        icon: 'https://placehold.co/200x200/7E69AB/FFFFFF?text=SS',
        description: 'U10 development team focusing on core netball skills and enjoyment',
      },
      {
        id: '3',
        name: 'Wildcats',
        ageGroup: 'U14',
        category: 'Junior',
        profileImage: 'https://placehold.co/400x300/33C3F0/FFFFFF?text=Wildcats',
        bannerImage: 'https://placehold.co/1200x300/33C3F0/FFFFFF?text=Wildcats',
        icon: 'https://placehold.co/200x200/33C3F0/FFFFFF?text=WC',
        description: 'Our premier U14 squad competing at regional level',
      },
    ];
    localStorage.setItem(TEAMS_KEY, JSON.stringify(defaultTeams));
  }

  if (!localStorage.getItem(EVENTS_KEY)) {
    const defaultEvents: Event[] = [
      {
        id: '1',
        name: 'Team Training',
        date: '2025-05-15',
        time: '16:00',
        location: 'Netball Court 1, Sports Center',
        notes: 'Please bring water and appropriate footwear',
        eventType: 'training',
        teamId: '1',
        recurring: true,
        recurrencePattern: 'weekly',
      },
      {
        id: '2',
        name: 'Match vs Eaglehawks',
        date: '2025-05-18',
        time: '10:00',
        location: 'Away - Eaglehawks Sports Center',
        notes: 'Please arrive 45 minutes before the match for warm-up',
        eventType: 'match',
        teamId: '1',
        opponent: 'Eaglehawks Netball Club',
      },
      {
        id: '3',
        name: 'End-of-Season Party',
        date: '2025-06-30',
        time: '17:00',
        location: 'Community Hall',
        notes: 'All players and families welcome. Please bring a dish to share',
        eventType: 'other',
        teamId: '1',
      },
    ];
    localStorage.setItem(EVENTS_KEY, JSON.stringify(defaultEvents));
  }

  if (!localStorage.getItem(ATTENDANCE_KEY)) {
    const defaultAttendance: Attendance[] = [
      {
        childId: '1',
        eventId: '1',
        status: 'present',
        rsvp: 'going',
      },
      {
        childId: '2',
        eventId: '1',
        status: 'absent',
        rsvp: 'not_going',
      },
      {
        childId: '3',
        eventId: '1',
        status: 'present',
        rsvp: 'going',
      },
    ];
    localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(defaultAttendance));
  }

  if (!localStorage.getItem(MATCH_STATS_KEY)) {
    const defaultMatchStats: MatchStats[] = [
      {
        childId: '1',
        eventId: '2',
        goals: 0,
        shotAttempts: 0,
        intercepts: 5,
        tips: 3,
        turnoversWon: 7,
        turnoversLost: 2,
        contacts: 1,
        obstructions: 0,
        footworkErrors: 1,
        quartersPlayed: 3,
        playerOfMatchCoach: true,
        playerOfMatchPlayers: false,
      },
      {
        childId: '3',
        eventId: '2',
        goals: 12,
        shotAttempts: 15,
        intercepts: 1,
        tips: 0,
        turnoversWon: 2,
        turnoversLost: 1,
        contacts: 0,
        obstructions: 1,
        footworkErrors: 0,
        quartersPlayed: 4,
        playerOfMatchCoach: false,
        playerOfMatchPlayers: true,
      },
    ];
    localStorage.setItem(MATCH_STATS_KEY, JSON.stringify(defaultMatchStats));
  }
};

// Initialize on first import
initializeLocalStorage();

/**
 * Helper function to generate unique IDs
 */
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * User API functions
 */
export const userApi = {
  getAll: (): User[] => {
    const users = localStorage.getItem(USERS_KEY);
    return users ? JSON.parse(users) : [];
  },
  
  getById: (id: string): User | undefined => {
    const users = userApi.getAll();
    return users.find(user => user.id === id);
  },
  
  getByEmail: (email: string): User | undefined => {
    const users = userApi.getAll();
    return users.find(user => user.email === email);
  },
  
  create: (user: Omit<User, 'id'>): User => {
    const newUser = { ...user, id: generateId() };
    const users = userApi.getAll();
    localStorage.setItem(USERS_KEY, JSON.stringify([...users, newUser]));
    return newUser;
  },
  
  update: (id: string, user: Partial<User>): User | undefined => {
    const users = userApi.getAll();
    const index = users.findIndex(u => u.id === id);
    
    if (index === -1) return undefined;
    
    const updatedUser = { ...users[index], ...user };
    users[index] = updatedUser;
    
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    return updatedUser;
  },
  
  delete: (id: string): boolean => {
    const users = userApi.getAll();
    const filteredUsers = users.filter(user => user.id !== id);
    
    if (filteredUsers.length === users.length) return false;
    
    localStorage.setItem(USERS_KEY, JSON.stringify(filteredUsers));
    return true;
  }
};

/**
 * Children API functions
 */
export const childrenApi = {
  getAll: (): Child[] => {
    const children = localStorage.getItem(CHILDREN_KEY);
    return children ? JSON.parse(children) : [];
  },
  
  getById: (id: string): Child | undefined => {
    const children = childrenApi.getAll();
    return children.find(child => child.id === id);
  },
  
  getByParentId: (parentId: string): Child[] => {
    const children = childrenApi.getAll();
    return children.filter(child => child.parentId === parentId);
  },
  
  getByTeamId: (teamId: string): Child[] => {
    const children = childrenApi.getAll();
    return children.filter(child => child.teamId === teamId && child.status === 'approved');
  },
  
  getPending: (): Child[] => {
    const children = childrenApi.getAll();
    return children.filter(child => child.status === 'pending');
  },
  
  create: (child: Omit<Child, 'id'>): Child => {
    const newChild = { ...child, id: generateId() };
    const children = childrenApi.getAll();
    localStorage.setItem(CHILDREN_KEY, JSON.stringify([...children, newChild]));
    return newChild;
  },
  
  update: (id: string, child: Partial<Child>): Child | undefined => {
    const children = childrenApi.getAll();
    const index = children.findIndex(c => c.id === id);
    
    if (index === -1) return undefined;
    
    const updatedChild = { ...children[index], ...child };
    children[index] = updatedChild;
    
    localStorage.setItem(CHILDREN_KEY, JSON.stringify(children));
    return updatedChild;
  },
  
  updateStatus: (id: string, status: 'pending' | 'approved' | 'rejected', teamId?: string): Child | undefined => {
    const children = childrenApi.getAll();
    const index = children.findIndex(c => c.id === id);
    
    if (index === -1) return undefined;
    
    const updatedChild = { 
      ...children[index], 
      status, 
      ...(teamId && { teamId })
    };
    children[index] = updatedChild;
    
    localStorage.setItem(CHILDREN_KEY, JSON.stringify(children));
    return updatedChild;
  },
  
  delete: (id: string): boolean => {
    const children = childrenApi.getAll();
    const filteredChildren = children.filter(child => child.id !== id);
    
    if (filteredChildren.length === children.length) return false;
    
    localStorage.setItem(CHILDREN_KEY, JSON.stringify(filteredChildren));
    return true;
  }
};

/**
 * Team API functions
 */
export const teamApi = {
  getAll: (): Team[] => {
    const teams = localStorage.getItem(TEAMS_KEY);
    return teams ? JSON.parse(teams) : [];
  },
  
  getById: (id: string): Team | undefined => {
    const teams = teamApi.getAll();
    return teams.find(team => team.id === id);
  },
  
  getByCategory: (category: string): Team[] => {
    if (category === 'All') return teamApi.getAll();
    
    const teams = teamApi.getAll();
    return teams.filter(team => team.category === category);
  },
  
  create: (team: Omit<Team, 'id'>): Team => {
    const newTeam = { ...team, id: generateId() };
    const teams = teamApi.getAll();
    localStorage.setItem(TEAMS_KEY, JSON.stringify([...teams, newTeam]));
    return newTeam;
  },
  
  update: (id: string, team: Partial<Team>): Team | undefined => {
    const teams = teamApi.getAll();
    const index = teams.findIndex(t => t.id === id);
    
    if (index === -1) return undefined;
    
    const updatedTeam = { ...teams[index], ...team };
    teams[index] = updatedTeam;
    
    localStorage.setItem(TEAMS_KEY, JSON.stringify(teams));
    return updatedTeam;
  },
  
  delete: (id: string): boolean => {
    const teams = teamApi.getAll();
    const filteredTeams = teams.filter(team => team.id !== id);
    
    if (filteredTeams.length === teams.length) return false;
    
    localStorage.setItem(TEAMS_KEY, JSON.stringify(filteredTeams));
    return true;
  }
};

/**
 * Event API functions
 */
export const eventApi = {
  getAll: (): Event[] => {
    const events = localStorage.getItem(EVENTS_KEY);
    return events ? JSON.parse(events) : [];
  },
  
  getById: (id: string): Event | undefined => {
    const events = eventApi.getAll();
    return events.find(event => event.id === id);
  },
  
  getByTeamId: (teamId: string): Event[] => {
    const events = eventApi.getAll();
    return events.filter(event => event.teamId === teamId);
  },
  
  create: (event: Omit<Event, 'id'>): Event => {
    const newEvent = { ...event, id: generateId() };
    const events = eventApi.getAll();
    localStorage.setItem(EVENTS_KEY, JSON.stringify([...events, newEvent]));
    return newEvent;
  },
  
  update: (id: string, event: Partial<Event>): Event | undefined => {
    const events = eventApi.getAll();
    const index = events.findIndex(e => e.id === id);
    
    if (index === -1) return undefined;
    
    const updatedEvent = { ...events[index], ...event };
    events[index] = updatedEvent;
    
    localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
    return updatedEvent;
  },
  
  delete: (id: string): boolean => {
    const events = eventApi.getAll();
    const filteredEvents = events.filter(event => event.id !== id);
    
    if (filteredEvents.length === events.length) return false;
    
    localStorage.setItem(EVENTS_KEY, JSON.stringify(filteredEvents));
    return true;
  }
};

/**
 * Attendance API functions
 */
export const attendanceApi = {
  getAll: (): Attendance[] => {
    const attendances = localStorage.getItem(ATTENDANCE_KEY);
    return attendances ? JSON.parse(attendances) : [];
  },
  
  getByEventId: (eventId: string): Attendance[] => {
    const attendances = attendanceApi.getAll();
    return attendances.filter(attendance => attendance.eventId === eventId);
  },
  
  getByChildId: (childId: string): Attendance[] => {
    const attendances = attendanceApi.getAll();
    return attendances.filter(attendance => attendance.childId === childId);
  },
  
  getByChildAndEvent: (childId: string, eventId: string): Attendance | undefined => {
    const attendances = attendanceApi.getAll();
    return attendances.find(a => a.childId === childId && a.eventId === eventId);
  },
  
  create: (attendance: Attendance): Attendance => {
    const attendances = attendanceApi.getAll();
    
    // Check if attendance record already exists
    const exists = attendances.some(
      a => a.childId === attendance.childId && a.eventId === attendance.eventId
    );
    
    if (exists) {
      return attendanceApi.update(attendance.childId, attendance.eventId, attendance) || attendance;
    }
    
    localStorage.setItem(ATTENDANCE_KEY, JSON.stringify([...attendances, attendance]));
    return attendance;
  },
  
  update: (childId: string, eventId: string, attendance: Partial<Attendance>): Attendance | undefined => {
    const attendances = attendanceApi.getAll();
    const index = attendances.findIndex(a => a.childId === childId && a.eventId === eventId);
    
    if (index === -1) return undefined;
    
    const updatedAttendance = { ...attendances[index], ...attendance };
    attendances[index] = updatedAttendance;
    
    localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(attendances));
    return updatedAttendance;
  },
  
  delete: (childId: string, eventId: string): boolean => {
    const attendances = attendanceApi.getAll();
    const filteredAttendances = attendances.filter(
      a => !(a.childId === childId && a.eventId === eventId)
    );
    
    if (filteredAttendances.length === attendances.length) return false;
    
    localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(filteredAttendances));
    return true;
  }
};

/**
 * Match Stats API functions
 */
export const matchStatsApi = {
  getAll: (): MatchStats[] => {
    const stats = localStorage.getItem(MATCH_STATS_KEY);
    return stats ? JSON.parse(stats) : [];
  },
  
  getByEventId: (eventId: string): MatchStats[] => {
    const stats = matchStatsApi.getAll();
    return stats.filter(stat => stat.eventId === eventId);
  },
  
  getByChildId: (childId: string): MatchStats[] => {
    const stats = matchStatsApi.getAll();
    return stats.filter(stat => stat.childId === childId);
  },
  
  getByChildAndEvent: (childId: string, eventId: string): MatchStats | undefined => {
    const stats = matchStatsApi.getAll();
    return stats.find(s => s.childId === childId && s.eventId === eventId);
  },
  
  create: (stats: MatchStats): MatchStats => {
    const allStats = matchStatsApi.getAll();
    
    // Check if stats record already exists
    const exists = allStats.some(
      s => s.childId === stats.childId && s.eventId === stats.eventId
    );
    
    if (exists) {
      return matchStatsApi.update(stats.childId, stats.eventId, stats) || stats;
    }
    
    localStorage.setItem(MATCH_STATS_KEY, JSON.stringify([...allStats, stats]));
    return stats;
  },
  
  update: (childId: string, eventId: string, stats: Partial<MatchStats>): MatchStats | undefined => {
    const allStats = matchStatsApi.getAll();
    const index = allStats.findIndex(s => s.childId === childId && s.eventId === eventId);
    
    if (index === -1) return undefined;
    
    const updatedStats = { ...allStats[index], ...stats };
    allStats[index] = updatedStats;
    
    localStorage.setItem(MATCH_STATS_KEY, JSON.stringify(allStats));
    return updatedStats;
  },
  
  delete: (childId: string, eventId: string): boolean => {
    const stats = matchStatsApi.getAll();
    const filteredStats = stats.filter(
      s => !(s.childId === childId && s.eventId === eventId)
    );
    
    if (filteredStats.length === stats.length) return false;
    
    localStorage.setItem(MATCH_STATS_KEY, JSON.stringify(filteredStats));
    return true;
  }
};
