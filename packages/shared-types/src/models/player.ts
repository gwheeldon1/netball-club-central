import { DatabaseUser } from './user';

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