// Simplified database types to avoid circular references
export interface DBUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  profileImage?: string;
  roles: string[];
}

export interface DBChild {
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

export interface DBTeam {
  id: string;
  name: string;
  ageGroup: string;
  category: 'Junior' | 'Senior' | 'Mixed';
  profileImage?: string;
  bannerImage?: string;
  icon?: string;
  description?: string;
}

export interface DBEvent {
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

export interface DBAttendance {
  childId: string;
  eventId: string;
  status: 'present' | 'absent' | 'injured' | 'late';
  rsvp: 'going' | 'not_going' | 'maybe';
}