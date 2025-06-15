import { Child } from './player';
import { User } from './user';

export interface Team {
  id: string;
  name: string;
  ageGroup: string;
  category: 'Junior' | 'Senior' | 'Mixed';
  profileImage?: string;
  bannerImage?: string;
  icon?: string;
  description?: string;
  players?: Child[];
  coaches?: User[];
  managers?: User[];
  season_year?: number;
  created_at?: string;
}