-- Step 4: Database Schema Cleanup - Add missing foreign keys and indexes only

-- 1. Add missing foreign key constraints for better data integrity
DO $$ 
BEGIN
    -- Add foreign keys if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_events_team_id') THEN
        ALTER TABLE public.events ADD CONSTRAINT fk_events_team_id FOREIGN KEY (team_id) REFERENCES public.teams(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_event_responses_event_id') THEN
        ALTER TABLE public.event_responses ADD CONSTRAINT fk_event_responses_event_id FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_event_responses_player_id') THEN
        ALTER TABLE public.event_responses ADD CONSTRAINT fk_event_responses_player_id FOREIGN KEY (player_id) REFERENCES public.players(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_player_teams_player_id') THEN
        ALTER TABLE public.player_teams ADD CONSTRAINT fk_player_teams_player_id FOREIGN KEY (player_id) REFERENCES public.players(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_player_teams_team_id') THEN
        ALTER TABLE public.player_teams ADD CONSTRAINT fk_player_teams_team_id FOREIGN KEY (team_id) REFERENCES public.teams(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 2. Add performance indexes for commonly queried columns
CREATE INDEX IF NOT EXISTS idx_events_team_id ON public.events(team_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON public.events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_type ON public.events(event_type);

CREATE INDEX IF NOT EXISTS idx_event_responses_event_id ON public.event_responses(event_id);
CREATE INDEX IF NOT EXISTS idx_event_responses_player_id ON public.event_responses(player_id);

CREATE INDEX IF NOT EXISTS idx_player_teams_player_id ON public.player_teams(player_id);
CREATE INDEX IF NOT EXISTS idx_player_teams_team_id ON public.player_teams(team_id);

CREATE INDEX IF NOT EXISTS idx_players_approval_status ON public.players(approval_status);
CREATE INDEX IF NOT EXISTS idx_players_date_of_birth ON public.players(date_of_birth);

CREATE INDEX IF NOT EXISTS idx_guardians_email ON public.guardians(email);
CREATE INDEX IF NOT EXISTS idx_guardians_approval_status ON public.guardians(approval_status);

CREATE INDEX IF NOT EXISTS idx_user_roles_guardian_id ON public.user_roles(guardian_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);
CREATE INDEX IF NOT EXISTS idx_user_roles_active ON public.user_roles(is_active);

CREATE INDEX IF NOT EXISTS idx_match_statistics_player_id ON public.match_statistics(player_id);
CREATE INDEX IF NOT EXISTS idx_match_statistics_event_id ON public.match_statistics(event_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);

-- 3. Add composite indexes for complex queries
CREATE INDEX IF NOT EXISTS idx_events_team_date ON public.events(team_id, event_date);
CREATE INDEX IF NOT EXISTS idx_players_status_team ON public.players(approval_status, team_preference);
CREATE INDEX IF NOT EXISTS idx_user_roles_guardian_active ON public.user_roles(guardian_id, is_active);