
export type UserRole = 'parent' | 'coach' | 'manager' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  profileImage?: string;
  roles: UserRole[];
  teams?: Team[];
}

export interface Child {
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

export interface Team {
  id: string;
  name: string;
  ageGroup: string;
  category: 'Junior' | 'Senior' | 'Mixed';
  profileImage?: string;
  bannerImage?: string;
  icon?: string;
  description?: string;
  players?: Child[];
  coaches?: User[];
  managers?: User[];
}

export interface Event {
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

export interface Attendance {
  childId: string;
  eventId: string;
  status: 'present' | 'absent' | 'injured' | 'late';
  rsvp: 'going' | 'not_going' | 'maybe';
}

export interface MatchStats {
  childId: string;
  eventId: string;
  goals: number;
  shotAttempts: number;
  intercepts: number;
  tips: number;
  turnoversWon: number;
  turnoversLost: number;
  contacts: number;
  obstructions: number;
  footworkErrors: number;
  quartersPlayed: number;
  playerOfMatchCoach: boolean;
  playerOfMatchPlayers: boolean;
}

export interface Subscription {
  userId: string;
  childId: string;
  status: 'active' | 'cancelled' | 'pending';
  startDate: string;
  endDate?: string;
}
