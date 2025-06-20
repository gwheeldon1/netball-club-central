
// Team-related type definitions
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
  status: 'approved' | 'pending' | 'rejected';
}

export interface TeamStaff {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
  roles: string[];
}

// New unified team member types
export type TeamMemberType = 'parent' | 'coach' | 'manager' | 'admin';

export interface TeamMember {
  id: string;
  teamId: string;
  memberId: string;
  memberType: TeamMemberType;
  playerId?: string; // Only for parents
  isActive: boolean;
  assignedAt: string;
  assignedBy?: string;
  member: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    profileImage?: string;
  };
  player?: {
    id: string;
    firstName: string;
    lastName: string;
    dateOfBirth?: string;
    profileImage?: string;
  };
}

export interface TeamMembershipRequest {
  teamId: string;
  memberId: string;
  memberType: Exclude<TeamMemberType, 'parent'>; // Parents are added automatically
  assignedBy?: string;
}

export interface ParentMembershipRequest {
  teamId: string;
  parentId: string;
  playerId: string;
}
