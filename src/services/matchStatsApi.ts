import { supabase } from '@/integrations/supabase/client';
import { MatchStats } from '@/types';

export interface MatchStatistics {
  id: string;
  playerId: string;
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
  createdAt: string;
  updatedAt: string;
}

/**
 * Match Statistics API service using Supabase
 */
export const matchStatsApi = {
  /**
   * Get match statistics for a specific event
   */
  getByEventId: async (eventId: string): Promise<MatchStatistics[]> => {
    const { data, error } = await supabase
      .from('match_statistics')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data?.map(stat => ({
      id: stat.id,
      playerId: stat.player_id,
      eventId: stat.event_id,
      goals: stat.goals,
      shotAttempts: stat.shot_attempts,
      intercepts: stat.intercepts,
      tips: stat.tips,
      turnoversWon: stat.turnovers_won,
      turnoversLost: stat.turnovers_lost,
      contacts: stat.contacts,
      obstructions: stat.obstructions,
      footworkErrors: stat.footwork_errors,
      quartersPlayed: stat.quarters_played,
      playerOfMatchCoach: stat.player_of_match_coach,
      playerOfMatchPlayers: stat.player_of_match_players,
      createdAt: stat.created_at,
      updatedAt: stat.updated_at,
    })) || [];
  },

  /**
   * Get match statistics for a specific player
   */
  getByPlayerId: async (playerId: string): Promise<MatchStatistics[]> => {
    const { data, error } = await supabase
      .from('match_statistics')
      .select('*')
      .eq('player_id', playerId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data?.map(stat => ({
      id: stat.id,
      playerId: stat.player_id,
      eventId: stat.event_id,
      goals: stat.goals,
      shotAttempts: stat.shot_attempts,
      intercepts: stat.intercepts,
      tips: stat.tips,
      turnoversWon: stat.turnovers_won,
      turnoversLost: stat.turnovers_lost,
      contacts: stat.contacts,
      obstructions: stat.obstructions,
      footworkErrors: stat.footwork_errors,
      quartersPlayed: stat.quarters_played,
      playerOfMatchCoach: stat.player_of_match_coach,
      playerOfMatchPlayers: stat.player_of_match_players,
      createdAt: stat.created_at,
      updatedAt: stat.updated_at,
    })) || [];
  },

  /**
   * Create or update match statistics
   */
  upsert: async (stats: Omit<MatchStatistics, 'id' | 'createdAt' | 'updatedAt'>): Promise<MatchStatistics> => {
    const { data, error } = await supabase
      .from('match_statistics')
      .upsert({
        player_id: stats.playerId,
        event_id: stats.eventId,
        goals: stats.goals,
        shot_attempts: stats.shotAttempts,
        intercepts: stats.intercepts,
        tips: stats.tips,
        turnovers_won: stats.turnoversWon,
        turnovers_lost: stats.turnoversLost,
        contacts: stats.contacts,
        obstructions: stats.obstructions,
        footwork_errors: stats.footworkErrors,
        quarters_played: stats.quartersPlayed,
        player_of_match_coach: stats.playerOfMatchCoach,
        player_of_match_players: stats.playerOfMatchPlayers,
        created_by: (await supabase.auth.getUser()).data.user?.id,
      }, {
        onConflict: 'player_id,event_id'
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      playerId: data.player_id,
      eventId: data.event_id,
      goals: data.goals,
      shotAttempts: data.shot_attempts,
      intercepts: data.intercepts,
      tips: data.tips,
      turnoversWon: data.turnovers_won,
      turnoversLost: data.turnovers_lost,
      contacts: data.contacts,
      obstructions: data.obstructions,
      footworkErrors: data.footwork_errors,
      quartersPlayed: data.quarters_played,
      playerOfMatchCoach: data.player_of_match_coach,
      playerOfMatchPlayers: data.player_of_match_players,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  },

  /**
   * Delete match statistics
   */
  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('match_statistics')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Get aggregated statistics for a player across all matches
   */
  getPlayerSummary: async (playerId: string): Promise<{
    totalGames: number;
    totalGoals: number;
    totalShotAttempts: number;
    shootingAccuracy: number;
    totalIntercepts: number;
    totalTips: number;
    playerOfMatchCount: number;
  }> => {
    const { data, error } = await supabase
      .from('match_statistics')
      .select('*')
      .eq('player_id', playerId);

    if (error) throw error;

    const stats = data || [];
    const totalGames = stats.length;
    const totalGoals = stats.reduce((sum, stat) => sum + stat.goals, 0);
    const totalShotAttempts = stats.reduce((sum, stat) => sum + stat.shot_attempts, 0);
    const shootingAccuracy = totalShotAttempts > 0 ? (totalGoals / totalShotAttempts) * 100 : 0;
    const totalIntercepts = stats.reduce((sum, stat) => sum + stat.intercepts, 0);
    const totalTips = stats.reduce((sum, stat) => sum + stat.tips, 0);
    const playerOfMatchCount = stats.filter(stat => stat.player_of_match_coach || stat.player_of_match_players).length;

    return {
      totalGames,
      totalGoals,
      totalShotAttempts,
      shootingAccuracy: Math.round(shootingAccuracy * 100) / 100,
      totalIntercepts,
      totalTips,
      playerOfMatchCount,
    };
  },
};