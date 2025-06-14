-- Create match statistics table
CREATE TABLE public.match_statistics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID NOT NULL,
  event_id UUID NOT NULL,
  goals INTEGER NOT NULL DEFAULT 0,
  shot_attempts INTEGER NOT NULL DEFAULT 0,
  intercepts INTEGER NOT NULL DEFAULT 0,
  tips INTEGER NOT NULL DEFAULT 0,
  turnovers_won INTEGER NOT NULL DEFAULT 0,
  turnovers_lost INTEGER NOT NULL DEFAULT 0,
  contacts INTEGER NOT NULL DEFAULT 0,
  obstructions INTEGER NOT NULL DEFAULT 0,
  footwork_errors INTEGER NOT NULL DEFAULT 0,
  quarters_played INTEGER NOT NULL DEFAULT 0 CHECK (quarters_played >= 0 AND quarters_played <= 4),
  player_of_match_coach BOOLEAN NOT NULL DEFAULT false,
  player_of_match_players BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID,
  UNIQUE(player_id, event_id)
);

-- Enable Row Level Security
ALTER TABLE public.match_statistics ENABLE ROW LEVEL SECURITY;

-- Create policies for match statistics
CREATE POLICY "Users can view match statistics for their teams" 
ON public.match_statistics 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.events e
    JOIN public.player_teams pt ON e.team_id = pt.team_id
    WHERE e.id = match_statistics.event_id
    AND (
      -- Admins can see all
      public.has_role(auth.uid(), 'admin'::user_role) OR
      -- Coaches/managers can see their team stats
      public.has_team_role(auth.uid(), 'coach'::user_role, e.team_id) OR
      public.has_team_role(auth.uid(), 'manager'::user_role, e.team_id) OR
      -- Parents can see their children's stats
      (public.has_role(auth.uid(), 'parent'::user_role) AND 
       EXISTS (SELECT 1 FROM public.guardians g WHERE g.id = auth.uid() AND g.player_id = match_statistics.player_id))
    )
  )
);

CREATE POLICY "Coaches and managers can create match statistics" 
ON public.match_statistics 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.events e
    WHERE e.id = match_statistics.event_id
    AND (
      public.has_role(auth.uid(), 'admin'::user_role) OR
      public.has_team_role(auth.uid(), 'coach'::user_role, e.team_id) OR
      public.has_team_role(auth.uid(), 'manager'::user_role, e.team_id)
    )
  )
);

CREATE POLICY "Coaches and managers can update match statistics" 
ON public.match_statistics 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.events e
    WHERE e.id = match_statistics.event_id
    AND (
      public.has_role(auth.uid(), 'admin'::user_role) OR
      public.has_team_role(auth.uid(), 'coach'::user_role, e.team_id) OR
      public.has_team_role(auth.uid(), 'manager'::user_role, e.team_id)
    )
  )
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_match_statistics_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_match_statistics_updated_at
BEFORE UPDATE ON public.match_statistics
FOR EACH ROW
EXECUTE FUNCTION public.update_match_statistics_updated_at();

-- Add foreign key constraints (using existing tables)
-- Note: We'll link to existing events and players tables