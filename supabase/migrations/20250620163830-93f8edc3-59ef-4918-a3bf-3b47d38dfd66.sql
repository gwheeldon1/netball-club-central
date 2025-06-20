
-- Create guardians_teams table to properly track parent-team relationships
CREATE TABLE public.guardians_teams (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  guardian_id uuid NOT NULL REFERENCES public.guardians(id) ON DELETE CASCADE,
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  player_id uuid NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(guardian_id, team_id, player_id)
);

-- Enable RLS on guardians_teams
ALTER TABLE public.guardians_teams ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for guardians_teams
CREATE POLICY "Users can view guardians_teams they have access to" 
ON public.guardians_teams 
FOR SELECT 
USING (
  public.can_access_team(team_id)
);

-- Function to sync guardian-team relationships when players are added/removed from teams
CREATE OR REPLACE FUNCTION public.sync_guardian_team_relationships()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- When a player is added to a team, add their guardians to the team
    INSERT INTO public.guardians_teams (guardian_id, team_id, player_id)
    SELECT g.id, NEW.team_id, NEW.player_id
    FROM public.guardians g
    WHERE g.player_id = NEW.player_id
    ON CONFLICT (guardian_id, team_id, player_id) DO NOTHING;
    
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- When a player is removed from a team, remove their guardians from the team
    -- (only if they don't have other children on the same team)
    DELETE FROM public.guardians_teams gt
    WHERE gt.guardian_id IN (
      SELECT g.id FROM public.guardians g WHERE g.player_id = OLD.player_id
    )
    AND gt.team_id = OLD.team_id
    AND gt.player_id = OLD.player_id;
    
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically sync guardian-team relationships
CREATE TRIGGER sync_guardian_teams_on_player_team_change
  AFTER INSERT OR DELETE ON public.player_teams
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_guardian_team_relationships();

-- Populate existing guardian-team relationships based on current player-team assignments
INSERT INTO public.guardians_teams (guardian_id, team_id, player_id)
SELECT DISTINCT g.id, pt.team_id, pt.player_id
FROM public.player_teams pt
JOIN public.guardians g ON g.player_id = pt.player_id
WHERE g.approval_status = 'approved'
ON CONFLICT (guardian_id, team_id, player_id) DO NOTHING;
