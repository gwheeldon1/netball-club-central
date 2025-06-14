import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

export interface AnalyticsEvent {
  id: string;
  event_type: string;
  event_name: string;
  user_id?: string;
  session_id?: string;
  properties: Record<string, any>;
  timestamp: string;
  team_id?: string;
  player_id?: string;
  event_id?: string;
}

export interface PerformanceMetric {
  id: string;
  metric_type: string;
  metric_name: string;
  value: number;
  period_start: string;
  period_end: string;
  team_id?: string;
  player_id?: string;
  calculated_at: string;
  metadata: Record<string, any>;
}

export interface DashboardStats {
  metric: string;
  value: string;
  unit: string;
  updated_at: number;
}

export interface AttendanceData {
  month: string;
  attendance: number;
}

export interface TeamAttendanceData {
  team: string;
  attendance: number;
}

export const analyticsApi = {
  // Track analytics events
  async trackEvent(eventData: Omit<AnalyticsEvent, 'id' | 'timestamp'>): Promise<void> {
    try {
      const { error } = await supabase
        .from('analytics_events')
        .insert(eventData);

      if (error) throw error;
    } catch (error) {
      logger.error('Error tracking analytics event:', error);
      // Don't throw - analytics shouldn't break the app
    }
  },

  // Get dashboard statistics
  async getDashboardStats(): Promise<DashboardStats[]> {
    try {
      const { data, error } = await supabase
        .from('dashboard_stats')
        .select('*');

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error('Error fetching dashboard stats:', error);
      // Return fallback data
      return [
        { metric: 'total_players', value: '0', unit: 'players', updated_at: Date.now() },
        { metric: 'active_teams', value: '0', unit: 'teams', updated_at: Date.now() },
        { metric: 'events_this_month', value: '0', unit: 'events', updated_at: Date.now() },
        { metric: 'avg_attendance', value: '0', unit: '%', updated_at: Date.now() },
      ];
    }
  },

  // Get attendance trends
  async getAttendanceTrends(
    teamId?: string, 
    months: number = 6
  ): Promise<AttendanceData[]> {
    try {
      // Calculate attendance for each of the last N months
      const endDate = new Date();
      const trends: AttendanceData[] = [];
      
      for (let i = months - 1; i >= 0; i--) {
        const monthStart = new Date(endDate.getFullYear(), endDate.getMonth() - i, 1);
        const monthEnd = new Date(endDate.getFullYear(), endDate.getMonth() - i + 1, 0);
        
        const { data: attendanceRate } = await supabase
          .rpc('calculate_attendance_rate', {
            p_team_id: teamId || null,
            p_start_date: monthStart.toISOString().split('T')[0],
            p_end_date: monthEnd.toISOString().split('T')[0]
          });

        trends.push({
          month: monthStart.toLocaleDateString('en-US', { month: 'short' }),
          attendance: attendanceRate || 0
        });
      }

      return trends;
    } catch (error) {
      logger.error('Error fetching attendance trends:', error);
      return [];
    }
  },

  // Get team attendance comparison
  async getTeamAttendanceComparison(): Promise<TeamAttendanceData[]> {
    try {
      const { data: teams, error: teamsError } = await supabase
        .from('teams')
        .select('id, name')
        .order('name');

      if (teamsError) throw teamsError;

      const teamAttendance: TeamAttendanceData[] = [];
      
      for (const team of teams || []) {
        const { data: attendanceRate } = await supabase
          .rpc('calculate_attendance_rate', {
            p_team_id: team.id,
            p_start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            p_end_date: new Date().toISOString().split('T')[0]
          });

        teamAttendance.push({
          team: team.name,
          attendance: attendanceRate || 0
        });
      }

      return teamAttendance;
    } catch (error) {
      logger.error('Error fetching team attendance comparison:', error);
      return [];
    }
  },

  // Get event type distribution
  async getEventTypeDistribution(days: number = 30): Promise<Array<{name: string; value: number; color: string}>> {
    try {
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      
      const { data, error } = await supabase
        .from('events')
        .select('event_type')
        .gte('event_date', startDate.toISOString());

      if (error) throw error;

      const typeCounts: Record<string, number> = {};
      const total = data?.length || 0;

      data?.forEach(event => {
        typeCounts[event.event_type] = (typeCounts[event.event_type] || 0) + 1;
      });

      const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];
      
      return Object.entries(typeCounts).map(([name, count], index) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value: Math.round((count / total) * 100),
        color: colors[index % colors.length]
      }));
    } catch (error) {
      logger.error('Error fetching event type distribution:', error);
      return [];
    }
  },

  // Get recent activities
  async getRecentActivities(limit: number = 10): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('analytics_events')
        .select(`
          id,
          event_type,
          event_name,
          properties,
          timestamp,
          user_id
        `)
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data?.map(event => ({
        id: event.id,
        type: event.event_type,
        title: this.formatEventTitle(event.event_name),
        description: this.formatEventDescription(event.properties),
        timestamp: new Date(event.timestamp),
        status: this.getEventStatus(event.event_type),
        user: event.user_id ? {
          name: 'User',
          initials: 'U'
        } : undefined
      })) || [];
    } catch (error) {
      logger.error('Error fetching recent activities:', error);
      return [];
    }
  },

  // Get team performance summary
  async getTeamPerformanceSummary(teamId: string, days: number = 30): Promise<any> {
    try {
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const endDate = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .rpc('get_team_performance_summary', {
          p_team_id: teamId,
          p_start_date: startDate,
          p_end_date: endDate
        });

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error fetching team performance summary:', error);
      return null;
    }
  },

  // Helper functions
  formatEventTitle(eventName: string): string {
    return eventName.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  },

  formatEventDescription(properties: Record<string, any>): string {
    if (properties.description) return properties.description;
    if (properties.event_type) return `${properties.event_type} event`;
    if (properties.team) return `Related to ${properties.team}`;
    return 'Activity recorded';
  },

  getEventStatus(eventType: string): 'success' | 'warning' | 'error' | 'info' {
    switch (eventType) {
      case 'user_action':
        return 'success';
      case 'page_view':
        return 'info';
      case 'error':
        return 'error';
      default:
        return 'info';
    }
  }
};