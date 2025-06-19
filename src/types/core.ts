
// Core types that match Supabase schema exactly
export interface DatabaseTeam {
  id: string;
  name: string;
  age_group: string;
  season_year?: number;
  description?: string;
  archived: boolean;
  group_id?: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseEvent {
  id: string;
  title: string;
  description?: string;
  event_date: string;
  event_type: string;
  location?: string;
  team_id?: string;
  is_home?: boolean;
  is_recurring: boolean;
  parent_event_id?: string;
  recurrence_type?: string;
  recurrence_interval?: number;
  recurrence_days?: string[];
  recurrence_end_date?: string;
  occurrence_date?: string;
  created_at: string;
}

export interface DatabasePlayer {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  gender?: string;
  medical_conditions?: string;
  medications?: string;
  allergies?: string;
  dietary_requirements?: string;
  additional_medical_notes?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  profile_image?: string;
  team_preference?: string;
  approval_status: string;
  sign_up_date?: string;
  approved_at?: string;
  approved_by?: string;
  rejection_reason?: string;
  terms_accepted: boolean;
  code_of_conduct_accepted: boolean;
  photo_consent: boolean;
  data_processing_consent: boolean;
  created_at: string;
  updated_at: string;
}

export interface DatabaseGuardian {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  relationship?: string;
  player_id?: string;
  approval_status: string;
  profile_image?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  medical_conditions?: string;
  medications?: string;
  allergies?: string;
  dietary_requirements?: string;
  additional_notes?: string;
  terms_accepted: boolean;
  code_of_conduct_accepted: boolean;
  photo_consent: boolean;
  registration_date: string;
  approved_at?: string;
  approved_by?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseEventResponse {
  id: string;
  event_id?: string;
  player_id?: string;
  rsvp_status: string;
  attendance_status?: string;
  attended?: boolean;
  notes?: string;
  marked_by?: string;
  attendance_marked_at?: string;
  response_date?: string;
}

// Application domain types (mapped from database types)
export interface Team {
  id: string;
  name: string;
  ageGroup: string;
  category: 'Junior' | 'Senior' | 'Mixed';
  description?: string;
  profileImage?: string;
  bannerImage?: string;
  icon?: string;
  players?: Child[];
  coaches?: User[];
  managers?: User[];
  active?: boolean;
  archived?: boolean;
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

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  profileImage?: string;
  roles: UserRole[];
  teams?: Team[];
}

export interface Attendance {
  childId: string;
  eventId: string;
  status: 'present' | 'absent' | 'injured' | 'late';
  rsvp: 'going' | 'not_going' | 'maybe';
}

export type UserRole = 'parent' | 'coach' | 'manager' | 'admin';

// Team member types
export interface TeamPlayer {
  id: string;
  name: string;
  profileImage?: string;
  ageGroup: string;
  dateOfBirth?: string;
  teamId: string;
  parentId: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface TeamStaff {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
  roles: string[];
}
