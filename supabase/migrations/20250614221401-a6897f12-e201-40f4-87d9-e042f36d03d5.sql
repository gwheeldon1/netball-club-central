-- Step 4: Database Schema Cleanup & Performance Optimizations

-- 1. Add missing foreign key constraints for better data integrity
ALTER TABLE public.events
ADD CONSTRAINT fk_events_team_id FOREIGN KEY (team_id) REFERENCES public.teams(id) ON DELETE CASCADE;

ALTER TABLE public.event_responses 
ADD CONSTRAINT fk_event_responses_event_id FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE,
ADD CONSTRAINT fk_event_responses_player_id FOREIGN KEY (player_id) REFERENCES public.players(id) ON DELETE CASCADE;

ALTER TABLE public.player_teams
ADD CONSTRAINT fk_player_teams_player_id FOREIGN KEY (player_id) REFERENCES public.players(id) ON DELETE CASCADE,
ADD CONSTRAINT fk_player_teams_team_id FOREIGN KEY (team_id) REFERENCES public.teams(id) ON DELETE CASCADE;

ALTER TABLE public.match_statistics
ADD CONSTRAINT fk_match_statistics_player_id FOREIGN KEY (player_id) REFERENCES public.players(id) ON DELETE CASCADE,
ADD CONSTRAINT fk_match_statistics_event_id FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;

ALTER TABLE public.subscriptions
ADD CONSTRAINT fk_subscriptions_guardian_id FOREIGN KEY (guardian_id) REFERENCES public.guardians(id) ON DELETE CASCADE,
ADD CONSTRAINT fk_subscriptions_player_id FOREIGN KEY (player_id) REFERENCES public.players(id) ON DELETE CASCADE;

ALTER TABLE public.payments
ADD CONSTRAINT fk_payments_guardian_id FOREIGN KEY (guardian_id) REFERENCES public.guardians(id) ON DELETE CASCADE,
ADD CONSTRAINT fk_payments_subscription_id FOREIGN KEY (subscription_id) REFERENCES public.subscriptions(id) ON DELETE CASCADE;

ALTER TABLE public.user_roles
ADD CONSTRAINT fk_user_roles_guardian_id FOREIGN KEY (guardian_id) REFERENCES public.guardians(id) ON DELETE CASCADE,
ADD CONSTRAINT fk_user_roles_team_id FOREIGN KEY (team_id) REFERENCES public.teams(id) ON DELETE CASCADE;

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

-- 3. Add unique constraints to prevent duplicate data
ALTER TABLE public.player_teams 
ADD CONSTRAINT unique_player_team UNIQUE (player_id, team_id);

ALTER TABLE public.user_roles
ADD CONSTRAINT unique_guardian_role_team UNIQUE (guardian_id, role, team_id);

ALTER TABLE public.event_responses
ADD CONSTRAINT unique_player_event_response UNIQUE (player_id, event_id);

ALTER TABLE public.match_statistics
ADD CONSTRAINT unique_player_event_stats UNIQUE (player_id, event_id);

-- 4. Add check constraints for data validation
ALTER TABLE public.events
ADD CONSTRAINT check_event_date_future CHECK (event_date >= CURRENT_DATE - INTERVAL '1 year');

ALTER TABLE public.players
ADD CONSTRAINT check_date_of_birth_reasonable CHECK (date_of_birth >= '1900-01-01' AND date_of_birth <= CURRENT_DATE);

ALTER TABLE public.match_statistics
ADD CONSTRAINT check_positive_stats CHECK (
    goals >= 0 AND shot_attempts >= 0 AND intercepts >= 0 AND tips >= 0 AND
    turnovers_won >= 0 AND turnovers_lost >= 0 AND contacts >= 0 AND
    obstructions >= 0 AND footwork_errors >= 0 AND quarters_played >= 0 AND quarters_played <= 4
);

-- 5. Create composite indexes for complex queries
CREATE INDEX IF NOT EXISTS idx_events_team_date ON public.events(team_id, event_date);
CREATE INDEX IF NOT EXISTS idx_players_status_team ON public.players(approval_status, team_preference);
CREATE INDEX IF NOT EXISTS idx_user_roles_guardian_active ON public.user_roles(guardian_id, is_active);