import { Team } from './team';

export interface Event {
  id: string;
  name: string;
  date: string;
  time: string;
  location: string;
  notes?: string;
  description?: string;
  eventType: 'training' | 'match' | 'social' | 'meeting' | 'other';
  teamId: string;
  recurring?: boolean;
  recurrencePattern?: string;
  opponent?: string;
  isHome?: boolean;
  requiresRSVP?: boolean;
  title?: string;
  event_date?: string;
  event_type?: string;
  team_id?: string;
  is_home?: boolean;
  teams?: Team;
  created_at?: string;
}