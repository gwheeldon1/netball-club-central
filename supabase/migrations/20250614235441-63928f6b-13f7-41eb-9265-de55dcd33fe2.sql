-- Analytics & Reporting System Database Schema

-- 1. Analytics events table for tracking user actions
CREATE TABLE public.analytics_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type text NOT NULL,
  event_name text NOT NULL,
  user_id uuid,
  session_id text,
  properties jsonb DEFAULT '{}',
  timestamp timestamp with time zone NOT NULL DEFAULT now(),
  team_id uuid REFERENCES public.teams(id),
  player_id uuid REFERENCES public.players(id),
  event_id uuid REFERENCES public.events(id)
);

-- 2. Performance metrics table for storing calculated metrics
CREATE TABLE public.performance_metrics (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_type text NOT NULL, -- 'attendance', 'engagement', 'team_performance'
  metric_name text NOT NULL,
  value numeric NOT NULL,
  period_start date NOT NULL,
  period_end date NOT NULL,
  team_id uuid REFERENCES public.teams(id),
  player_id uuid REFERENCES public.players(id),
  calculated_at timestamp with time zone NOT NULL DEFAULT now(),
  metadata jsonb DEFAULT '{}'
);

-- 3. Reports table for storing generated reports
CREATE TABLE public.reports (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  report_type text NOT NULL, -- 'attendance', 'team_summary', 'player_performance'
  title text NOT NULL,
  description text,
  filters jsonb DEFAULT '{}',
  data jsonb NOT NULL,
  generated_by uuid,
  generated_at timestamp with time zone NOT NULL DEFAULT now(),
  period_start date,
  period_end date,
  is_public boolean DEFAULT false,
  expires_at timestamp with time zone
);

-- 4. Dashboard widgets table for customizable dashboards
CREATE TABLE public.dashboard_widgets (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  widget_type text NOT NULL, -- 'stats_card', 'chart', 'activity_feed'
  title text NOT NULL,
  configuration jsonb NOT NULL DEFAULT '{}',
  position jsonb NOT NULL DEFAULT '{"x": 0, "y": 0, "w": 1, "h": 1}',
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 5. Create indexes for performance
CREATE INDEX idx_analytics_events_type ON public.analytics_events(event_type);
CREATE INDEX idx_analytics_events_timestamp ON public.analytics_events(timestamp);
CREATE INDEX idx_analytics_events_user_id ON public.analytics_events(user_id);
CREATE INDEX idx_analytics_events_team_id ON public.analytics_events(team_id);

CREATE INDEX idx_performance_metrics_type ON public.performance_metrics(metric_type);
CREATE INDEX idx_performance_metrics_period ON public.performance_metrics(period_start, period_end);
CREATE INDEX idx_performance_metrics_team ON public.performance_metrics(team_id);

CREATE INDEX idx_reports_type ON public.reports(report_type);
CREATE INDEX idx_reports_generated_at ON public.reports(generated_at);
CREATE INDEX idx_reports_public ON public.reports(is_public) WHERE is_public = true;

CREATE INDEX idx_dashboard_widgets_user ON public.dashboard_widgets(user_id);
CREATE INDEX idx_dashboard_widgets_active ON public.dashboard_widgets(is_active) WHERE is_active = true;

-- 6. Enable RLS
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboard_widgets ENABLE ROW LEVEL SECURITY;

-- 7. Create RLS policies

-- Analytics events policies
CREATE POLICY "Admins can view all analytics events" ON public.analytics_events
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Users can view their own analytics events" ON public.analytics_events
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can insert analytics events" ON public.analytics_events
  FOR INSERT WITH CHECK (true);

-- Performance metrics policies  
CREATE POLICY "Admins can manage all performance metrics" ON public.performance_metrics
  FOR ALL USING (public.is_admin());

CREATE POLICY "Coaches can view team metrics" ON public.performance_metrics
  FOR SELECT USING (
    public.user_has_role('coach') AND 
    (team_id IS NULL OR public.can_access_team(team_id))
  );

CREATE POLICY "Parents can view their player metrics" ON public.performance_metrics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.players p
      JOIN public.guardians g ON g.player_id = p.id
      WHERE g.id = auth.uid() AND p.id = performance_metrics.player_id
    )
  );

-- Reports policies
CREATE POLICY "Admins can manage all reports" ON public.reports
  FOR ALL USING (public.is_admin());

CREATE POLICY "Users can view public reports" ON public.reports
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can view their own reports" ON public.reports
  FOR ALL USING (generated_by = auth.uid());

CREATE POLICY "Coaches can view team reports" ON public.reports
  FOR SELECT USING (
    public.user_has_role('coach') AND
    filters->>'team_id' IS NOT NULL AND
    public.can_access_team((filters->>'team_id')::uuid)
  );

-- Dashboard widgets policies
CREATE POLICY "Users can manage their own dashboard widgets" ON public.dashboard_widgets
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Admins can view all dashboard widgets" ON public.dashboard_widgets
  FOR SELECT USING (public.is_admin());

-- 8. Create functions for analytics calculations

-- Calculate attendance rate for a team/period
CREATE OR REPLACE FUNCTION public.calculate_attendance_rate(
  p_team_id uuid DEFAULT NULL,
  p_start_date date DEFAULT CURRENT_DATE - INTERVAL '30 days',
  p_end_date date DEFAULT CURRENT_DATE
)
RETURNS numeric
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT 
    CASE 
      WHEN COUNT(*) = 0 THEN 0
      ELSE ROUND(
        (COUNT(*) FILTER (WHERE attended = true)::numeric / COUNT(*)) * 100, 
        2
      )
    END
  FROM public.event_responses er
  JOIN public.events e ON e.id = er.event_id
  WHERE (p_team_id IS NULL OR e.team_id = p_team_id)
    AND e.event_date BETWEEN p_start_date AND p_end_date
    AND er.attendance_status = 'marked';
$$;

-- Get team performance summary
CREATE OR REPLACE FUNCTION public.get_team_performance_summary(
  p_team_id uuid,
  p_start_date date DEFAULT CURRENT_DATE - INTERVAL '30 days',
  p_end_date date DEFAULT CURRENT_DATE
)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT jsonb_build_object(
    'team_id', p_team_id,
    'period_start', p_start_date,
    'period_end', p_end_date,
    'total_events', (
      SELECT COUNT(*) FROM public.events 
      WHERE team_id = p_team_id 
        AND event_date BETWEEN p_start_date AND p_end_date
    ),
    'total_players', (
      SELECT COUNT(DISTINCT pt.player_id) 
      FROM public.player_teams pt 
      WHERE pt.team_id = p_team_id
    ),
    'attendance_rate', public.calculate_attendance_rate(p_team_id, p_start_date, p_end_date),
    'response_rate', (
      SELECT 
        CASE 
          WHEN COUNT(*) = 0 THEN 0
          ELSE ROUND(
            (COUNT(*) FILTER (WHERE rsvp_status IN ('attending', 'not_attending'))::numeric / COUNT(*)) * 100, 
            2
          )
        END
      FROM public.event_responses er
      JOIN public.events e ON e.id = er.event_id
      WHERE e.team_id = p_team_id
        AND e.event_date BETWEEN p_start_date AND p_end_date
    )
  );
$$;

-- 9. Create triggers for updating timestamps
CREATE TRIGGER update_dashboard_widgets_updated_at
  BEFORE UPDATE ON public.dashboard_widgets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_profiles_updated_at();

-- 10. Insert some sample analytics data
INSERT INTO public.analytics_events (event_type, event_name, properties) VALUES
  ('page_view', 'dashboard_viewed', '{"page": "dashboard"}'),
  ('user_action', 'event_created', '{"event_type": "training"}'),
  ('user_action', 'player_registered', '{"team": "U12"}');

-- 11. Create view for dashboard statistics
CREATE OR REPLACE VIEW public.dashboard_stats AS
SELECT 
  'total_players' as metric,
  COUNT(*)::text as value,
  'players' as unit,
  EXTRACT(EPOCH FROM NOW())::bigint as updated_at
FROM public.players WHERE approval_status = 'approved'

UNION ALL

SELECT 
  'active_teams' as metric,
  COUNT(*)::text as value,
  'teams' as unit,
  EXTRACT(EPOCH FROM NOW())::bigint as updated_at
FROM public.teams

UNION ALL

SELECT 
  'events_this_month' as metric,
  COUNT(*)::text as value,
  'events' as unit,
  EXTRACT(EPOCH FROM NOW())::bigint as updated_at
FROM public.events 
WHERE event_date >= DATE_TRUNC('month', CURRENT_DATE)
  AND event_date < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'

UNION ALL

SELECT 
  'avg_attendance' as metric,
  COALESCE(ROUND(public.calculate_attendance_rate(), 0)::text, '0') as value,
  '%' as unit,
  EXTRACT(EPOCH FROM NOW())::bigint as updated_at;