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

export interface UserProfile {
  id: string;
  userId: string; // Links to auth.users
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  profileImage?: string;
  createdAt: string;
  updatedAt: string;
}

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