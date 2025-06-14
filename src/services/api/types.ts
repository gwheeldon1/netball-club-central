// API layer types for unified service interface
import { User, Child, Team, Event, Attendance, UserRole } from '@/types';

// Base API response structure
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  success: boolean;
}

// Pagination
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// API Error types
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Request/Response types matching database schema
export interface UserCreateRequest {
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  relationship?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  medical_conditions?: string;
  medications?: string;
  allergies?: string;
  dietary_requirements?: string;
  additional_notes?: string;
}

export interface UserUpdateRequest extends Partial<UserCreateRequest> {}

export interface ChildCreateRequest {
  first_name: string;
  last_name: string;
  date_of_birth?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  gender?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  medical_conditions?: string;
  medications?: string;
  additional_medical_notes?: string;
  allergies?: string;
  dietary_requirements?: string;
  team_preference?: string;
}

export interface ChildUpdateRequest extends Partial<ChildCreateRequest> {}

export interface TeamCreateRequest {
  name: string;
  age_group: string;
  season_year?: number;
}

export interface TeamUpdateRequest extends Partial<TeamCreateRequest> {}

export interface EventCreateRequest {
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
}

export interface EventUpdateRequest extends Partial<Omit<EventCreateRequest, 'team_id'>> {}

export interface AttendanceUpdateRequest {
  status: 'present' | 'absent' | 'injured' | 'late';
  rsvp: 'going' | 'not_going' | 'maybe';
}

// API Configuration
export interface ApiConfig {
  baseUrl?: string;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  enableOffline?: boolean;
}

// Sync status for offline functionality
export interface SyncItem {
  id: string;
  tableName: string;
  recordId: string;
  action: 'create' | 'update' | 'delete';
  data?: any;
  timestamp: number;
  retries: number;
}