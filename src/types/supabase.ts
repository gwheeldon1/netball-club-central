// Supabase response types
export interface SupabasePlayer {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  profile_image?: string;
  approval_status: 'pending' | 'approved' | 'rejected';
  team_preference?: string;
  sign_up_date?: string;
  approved_by?: string;
  approved_at?: string;
  rejection_reason?: string;
}

export interface SupabaseGuardian {
  id: string;
  player_id?: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  relationship?: string;
  profile_image?: string;
  approval_status: 'pending' | 'approved' | 'rejected';
  registration_date?: string;
  approved_by?: string;
  approved_at?: string;
  rejection_reason?: string;
  terms_accepted?: boolean;
  code_of_conduct_accepted?: boolean;
  photo_consent?: boolean;
  user_roles?: SupabaseUserRole[];
}

export interface SupabaseTeam {
  id: string;
  name: string;
  age_group: string;
  season_year?: number;
}

export interface SupabaseUserRole {
  id: string;
  guardian_id: string;
  role: 'parent' | 'coach' | 'manager' | 'admin';
  team_id?: string;
  is_active: boolean;
  assigned_at?: string;
  assigned_by?: string;
}

export interface SupabaseEvent {
  id: string;
  title: string;
  description?: string;
  event_date: string;
  event_type: 'training' | 'match' | 'other';
  location?: string;
  team_id?: string;
  is_home?: boolean;
  created_at?: string;
}

export interface SupabaseEventResponse {
  id: string;
  event_id?: string;
  player_id?: string;
  rsvp_status: 'going' | 'not_going' | 'maybe';
  attended?: boolean;
  attendance_marked_at?: string;
  response_date?: string;
  notes?: string;
}

export interface SupabasePlayerTeam {
  id: string;
  player_id?: string;
  team_id?: string;
  join_date?: string;
}

export interface PendingRegistration {
  guardian: SupabaseGuardian;
  players: SupabasePlayer[];
}