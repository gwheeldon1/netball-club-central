
// Team API specific types
export interface TeamData {
  id: string;
  name: string;
  age_group: string;
  season_year?: number;
  archived: boolean;
  description?: string;
  profile_image?: string;
  banner_image?: string;
  icon?: string;
}

export interface TeamCreateData {
  name: string;
  age_group: string;
  season_year?: number;
  description?: string;
  profile_image?: string;
  banner_image?: string;
  icon?: string;
  archived?: boolean;
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
  status: 'approved';
}

export interface TeamStaff {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
  roles: string[];
}
