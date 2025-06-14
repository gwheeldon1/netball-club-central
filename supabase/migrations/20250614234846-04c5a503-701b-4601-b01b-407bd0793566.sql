-- Phase 1 Final Data Cleanup & Optimization (Fixed)

-- 1. Clean up any duplicate or orphaned data
DELETE FROM public.user_roles 
WHERE id IN (
  SELECT id FROM (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY guardian_id, role, team_id ORDER BY assigned_at DESC) as rn
    FROM public.user_roles
  ) t WHERE t.rn > 1
);

-- 2. Enable RLS on tables that don't have it
DO $$ 
BEGIN
    -- Check and enable RLS for each table if not already enabled
    IF NOT (SELECT relrowsecurity FROM pg_class WHERE relname = 'profiles') THEN
        ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF NOT (SELECT relrowsecurity FROM pg_class WHERE relname = 'guardians') THEN
        ALTER TABLE public.guardians ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF NOT (SELECT relrowsecurity FROM pg_class WHERE relname = 'players') THEN
        ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF NOT (SELECT relrowsecurity FROM pg_class WHERE relname = 'teams') THEN
        ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF NOT (SELECT relrowsecurity FROM pg_class WHERE relname = 'events') THEN
        ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF NOT (SELECT relrowsecurity FROM pg_class WHERE relname = 'event_responses') THEN
        ALTER TABLE public.event_responses ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF NOT (SELECT relrowsecurity FROM pg_class WHERE relname = 'match_statistics') THEN
        ALTER TABLE public.match_statistics ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF NOT (SELECT relrowsecurity FROM pg_class WHERE relname = 'notifications') THEN
        ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- 3. Create security definer functions for role checking
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.guardians g ON g.id = ur.guardian_id
    WHERE g.id = auth.uid() AND ur.role = 'admin' AND ur.is_active = true
  );
$$;

CREATE OR REPLACE FUNCTION public.user_has_role(check_role user_role)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.guardians g ON g.id = ur.guardian_id
    WHERE g.id = auth.uid() AND ur.role = check_role AND ur.is_active = true
  );
$$;

CREATE OR REPLACE FUNCTION public.can_access_team(team_id uuid)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT 
    public.is_admin() OR
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.guardians g ON g.id = ur.guardian_id
      WHERE g.id = auth.uid() 
        AND ur.is_active = true
        AND (ur.team_id = $1 OR ur.team_id IS NULL)
    ) OR
    EXISTS (
      SELECT 1 FROM public.players p
      JOIN public.player_teams pt ON pt.player_id = p.id
      JOIN public.guardians g ON g.player_id = p.id
      WHERE g.id = auth.uid() AND pt.team_id = $1
    );
$$;

-- 4. Optimize database performance with additional indexes
CREATE INDEX IF NOT EXISTS idx_guardians_player_id ON public.guardians(player_id) WHERE player_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_events_created_at ON public.events(created_at);
CREATE INDEX IF NOT EXISTS idx_event_responses_response_date ON public.event_responses(response_date);
CREATE INDEX IF NOT EXISTS idx_match_statistics_created_at ON public.match_statistics(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at);

-- 5. Update existing timestamps for better data consistency
UPDATE public.events SET created_at = COALESCE(created_at, now()) WHERE created_at IS NULL;
UPDATE public.guardians SET registration_date = COALESCE(registration_date, now()) WHERE registration_date IS NULL;

-- 6. Add data validation triggers
CREATE OR REPLACE FUNCTION public.validate_event_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Ensure event date is reasonable
  IF NEW.event_date < CURRENT_DATE - INTERVAL '1 year' OR 
     NEW.event_date > CURRENT_DATE + INTERVAL '2 years' THEN
    RAISE EXCEPTION 'Event date must be within reasonable range';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS validate_event_data_trigger ON public.events;
CREATE TRIGGER validate_event_data_trigger
  BEFORE INSERT OR UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.validate_event_data();

-- 7. Clean up any invalid data
DELETE FROM public.events WHERE event_date < '2020-01-01' OR event_date > '2030-12-31';
DELETE FROM public.players WHERE date_of_birth < '1900-01-01' OR date_of_birth > CURRENT_DATE;

-- 8. Ensure referential integrity
UPDATE public.guardians SET player_id = NULL 
WHERE player_id IS NOT NULL AND NOT EXISTS (
  SELECT 1 FROM public.players WHERE id = guardians.player_id
);

UPDATE public.player_teams SET team_id = NULL 
WHERE team_id IS NOT NULL AND NOT EXISTS (
  SELECT 1 FROM public.teams WHERE id = player_teams.team_id
);

-- 9. Update table statistics for optimal query planning
ANALYZE public.guardians;
ANALYZE public.players;
ANALYZE public.teams;
ANALYZE public.events;
ANALYZE public.event_responses;
ANALYZE public.user_roles;
ANALYZE public.match_statistics;
ANALYZE public.notifications;