// Enhanced types to replace 'any' usage throughout the application
import { UserRole } from '@/types';

// Database entity types based on Supabase schema
export interface DatabaseGuardian {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  relationship?: string;
  player_id?: string;
  terms_accepted?: boolean;
  code_of_conduct_accepted?: boolean;
  photo_consent?: boolean;
  registration_date?: string;
  approved_at?: string;
  approved_by?: string;
  approval_status?: 'pending' | 'approved' | 'rejected';
  profile_image?: string;
  rejection_reason?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  medical_conditions?: string;
  medications?: string;
  allergies?: string;
  dietary_requirements?: string;
  additional_notes?: string;
  user_roles?: DatabaseUserRole[];
  players?: DatabasePlayer[];
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
  sign_up_date?: string;
  approval_status?: 'pending' | 'approved' | 'rejected';
  approved_at?: string;
  approved_by?: string;
  rejection_reason?: string;
  medical_conditions?: string;
  medications?: string;
  additional_medical_notes?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  terms_accepted?: boolean;
  code_of_conduct_accepted?: boolean;
  photo_consent?: boolean;
  data_processing_consent?: boolean;
  team_preference?: string;
  profile_image?: string;
  allergies?: string;
  dietary_requirements?: string;
}

export interface DatabaseTeam {
  id: string;
  name: string;
  age_group: string;
  season_year?: number;
}

export interface DatabaseEvent {
  id: string;
  title: string;
  event_date: string;
  location?: string;
  description?: string;
  event_type: string;
  team_id?: string;
  is_home?: boolean;
  recurrence_type?: string;
  recurrence_interval?: number;
  recurrence_days?: string[];
  recurrence_end_date?: string;
  parent_event_id?: string;
  created_at?: string;
  event_responses?: DatabaseEventResponse[];
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

export interface DatabaseUserRole {
  id: string;
  guardian_id: string;
  role: UserRole;
  team_id?: string;
  is_active?: boolean;
  assigned_at?: string;
  assigned_by?: string;
}

export interface DatabaseMatchStatistic {
  id: string;
  event_id: string;
  player_id: string;
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
  created_at?: string;
  updated_at?: string;
}

// Combined types with relationships
export interface GuardianWithRoles extends DatabaseGuardian {
  user_roles: DatabaseUserRole[];
}

export interface PlayerWithGuardian extends DatabasePlayer {
  guardian?: DatabaseGuardian;
  team_name?: string;
}

export interface EventWithResponses extends DatabaseEvent {
  event_responses: DatabaseEventResponse[];
}

// Payment and subscription types
export interface DatabasePayment {
  id: string;
  guardian_id: string;
  subscription_id: string;
  amount_pence: number;
  currency: string;
  status: string;
  payment_method?: string;
  stripe_payment_intent_id?: string;
  stripe_charge_id?: string;
  stripe_invoice_id?: string;
  description?: string;
  failure_reason?: string;
  payment_type?: string;
  billing_period_start?: string;
  billing_period_end?: string;
  processed_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DatabaseSubscription {
  id: string;
  player_id: string;
  guardian_id: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  amount_pence: number;
  billing_cycle: string;
  status: string;
  start_date: string;
  end_date?: string;
  next_billing_date?: string;
  auto_renew: boolean;
  cancelled_at?: string;
  cancellation_reason?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

// Analytics types
export interface PlayerPerformanceStats {
  playerId: string;
  playerName: string;
  totalGoals: number;
  totalAttempts: number;
  shootingPercentage: number;
  totalIntercepts: number;
  totalTips: number;
  totalTurnoversWon: number;
  totalTurnoversLost: number;
  averageQuartersPlayed: number;
  playerOfMatchCount: number;
  gamesPlayed: number;
}

export interface TeamPerformanceStats {
  teamId: string;
  teamName: string;
  totalEvents: number;
  averageAttendance: number;
  totalPlayers: number;
  activePlayersCount: number;
}

export interface AttendanceAnalytics {
  eventId: string;
  eventTitle: string;
  eventDate: string;
  totalInvited: number;
  goingCount: number;
  notGoingCount: number;
  maybeCount: number;
  noResponseCount: number;
  attendanceRate: number;
}

// Form data types
export interface RegistrationFormData {
  // Guardian information
  guardianFirstName: string;
  guardianLastName: string;
  guardianEmail: string;
  guardianPhone?: string;
  relationship?: string;
  
  // Emergency contact
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
  
  // Children information
  children: Array<{
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender?: string;
    teamPreference?: string;
    medicalConditions?: string;
    medications?: string;
    allergies?: string;
    dietaryRequirements?: string;
    additionalNotes?: string;
  }>;
  
  // Consents
  termsAccepted: boolean;
  codeOfConductAccepted: boolean;
  photoConsent: boolean;
  dataProcessingConsent: boolean;
}

// API response wrapper types
export interface SupabaseResponse<T> {
  data: T | null;
  error: {
    message: string;
    code?: string;
  } | null;
}

// Custom calendar event type
export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource?: {
    eventType: string;
    teamId?: string;
    location?: string;
    description?: string;
  };
}

// Custom toolbar props for react-big-calendar
export interface CustomToolbarProps {
  label: string;
  onNavigate: (action: 'PREV' | 'NEXT' | 'TODAY') => void;
  onView: (view: 'month' | 'week' | 'day' | 'agenda') => void;
}

// File upload types
export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CropAreaPixels extends CropArea {
  // Same interface but represents pixel values instead of percentages
}

// Performance decorator types
export type AsyncFunction<T extends unknown[] = unknown[], R = unknown> = (...args: T) => Promise<R>;
export type SyncFunction<T extends unknown[] = unknown[], R = unknown> = (...args: T) => R;

// Generic validation state type
export type ValidationState<T extends Record<string, unknown>> = {
  [K in keyof T]: {
    value: T[K];
    error?: string;
    isValid: boolean;
  };
};

// Circuit breaker state
export interface CircuitBreakerState {
  isOpen: boolean;
  failureCount: number;
  lastFailureTime?: number;
  nextAttemptTime?: number;
}