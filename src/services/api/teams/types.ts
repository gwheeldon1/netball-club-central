
// Types for team-related API operations
export interface TeamData {
  id: string;
  name: string;
  age_group: string;
  season_year?: number;
  description?: string;
  profile_image?: string;
  banner_image?: string;
  icon?: string;
  archived?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface TeamCreateData {
  name: string;
  age_group: string;
  season_year?: number;
  description?: string;
  profile_image?: string;
  banner_image?: string;
  icon?: string;
}

export interface TeamUpdateData {
  name?: string;
  age_group?: string;
  description?: string;
  profile_image?: string;
  banner_image?: string;
  icon?: string;
  archived?: boolean;
}

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
