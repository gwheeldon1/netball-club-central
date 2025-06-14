// Shared TypeScript interfaces to replace 'any' types

export interface DatabaseUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  approval_status: string;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  role: string;
  team_id?: string;
  is_active: boolean;
  assigned_at: string;
}

export interface UserWithMetadata extends DatabaseUser {
  roles: string[];
  teams: string[];
  lastActivity: string;
  registrationDate: string;
}

export interface Guardian extends DatabaseUser {
  relationship: string;
  player_id?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  medical_conditions?: string;
  medications?: string;
  allergies?: string;
  dietary_requirements?: string;
  additional_notes?: string;
  user_roles?: UserRole[];
  approved_at?: string;
  approved_by?: string;
  rejection_reason?: string;
  registration_date?: string;
}

export interface Player extends DatabaseUser {
  date_of_birth: string;
  gender: string;
  address?: string;
  city?: string;
  postal_code?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  medical_conditions?: string;
  medications?: string;
  allergies?: string;
  dietary_requirements?: string;
  additional_medical_notes?: string;
  terms_accepted: boolean;
  code_of_conduct_accepted: boolean;
  photo_consent: boolean;
  data_processing_consent: boolean;
  profile_image?: string;
  team_preference?: string;
  sign_up_date: string;
  approved_at?: string;
  approved_by?: string;
  rejection_reason?: string;
  teams?: { name: string; age_group: string };
}

export interface Team {
  id: string;
  name: string;
  age_group: string;
  season_year?: number;
  created_at: string;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  event_date: string;
  event_type: string;
  location?: string;
  team_id?: string;
  is_home?: boolean;
  teams?: Team;
  created_at: string;
}

export interface EventResponse {
  id: string;
  player_id: string;
  event_id: string;
  rsvp_status: 'going' | 'not_going' | 'maybe';
  response_date: string;
  attendance_status?: string;
  attended?: boolean;
  marked_by?: string;
  attendance_marked_at?: string;
  notes?: string;
}

export interface MatchStatistic {
  id: string;
  player_id: string;
  event_id: string;
  goals: number;
  shot_attempts: number;
  intercepts: number;
  tips: number;
  turnovers_won: number;
  turnovers_lost: number;
  contacts: number;
  obstructions: number;
  footwork_errors: number;
  quarters_played: number;
  player_of_match_players: boolean;
  player_of_match_coach: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  user_id: string;
  related_event_id?: string;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface FilterOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  searchTerm?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface ComponentWithChildren {
  children: React.ReactNode;
}

export interface FormFieldError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: FormFieldError[];
}