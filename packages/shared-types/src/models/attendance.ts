export interface Attendance {
  childId: string;
  eventId: string;
  status: 'present' | 'absent' | 'injured' | 'late';
  rsvp: 'going' | 'not_going' | 'maybe';
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

export interface MatchStats {
  childId: string;
  eventId: string;
  goals: number;
  shotAttempts: number;
  intercepts: number;
  tips: number;
  turnoversWon: number;
  turnoversLost: number;
  contacts: number;
  obstructions: number;
  footworkErrors: number;
  quartersPlayed: number;
  playerOfMatchCoach: boolean;
  playerOfMatchPlayers: boolean;
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