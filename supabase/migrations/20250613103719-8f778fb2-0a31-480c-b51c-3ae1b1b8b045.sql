-- Create user roles enum
CREATE TYPE public.user_role AS ENUM ('parent', 'coach', 'manager', 'admin');

-- Create user_roles table to assign roles to guardians
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guardian_id UUID REFERENCES public.guardians(id) ON DELETE CASCADE NOT NULL,
  role user_role NOT NULL,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  assigned_by UUID REFERENCES public.guardians(id),
  team_id UUID REFERENCES public.teams(id), -- For coach/manager assignments to specific teams
  is_active BOOLEAN DEFAULT true,
  UNIQUE(guardian_id, role, team_id) -- Prevent duplicate role assignments for same team
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.get_user_roles(user_id UUID)
RETURNS user_role[]
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT ARRAY_AGG(role) 
  FROM public.user_roles ur
  JOIN public.guardians g ON g.id = ur.guardian_id
  WHERE g.id = user_id 
    AND ur.is_active = true;
$$;

-- Function to check if user has specific role
CREATE OR REPLACE FUNCTION public.has_role(user_id UUID, check_role user_role)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_roles ur
    JOIN public.guardians g ON g.id = ur.guardian_id
    WHERE g.id = user_id 
      AND ur.role = check_role 
      AND ur.is_active = true
  );
$$;

-- Function to check if user has role for specific team
CREATE OR REPLACE FUNCTION public.has_team_role(user_id UUID, check_role user_role, check_team_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_roles ur
    JOIN public.guardians g ON g.id = ur.guardian_id
    WHERE g.id = user_id 
      AND ur.role = check_role 
      AND (ur.team_id = check_team_id OR ur.team_id IS NULL) -- NULL means all teams
      AND ur.is_active = true
  );
$$;

-- RLS Policies for user_roles table
CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
USING (guardian_id = auth.uid());

CREATE POLICY "Admins can view all roles" 
ON public.user_roles 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all roles" 
ON public.user_roles 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Update existing table policies

-- Enable RLS on guardians if not already enabled
ALTER TABLE public.guardians ENABLE ROW LEVEL SECURITY;

-- Guardians table policies
CREATE POLICY "Users can view their own profile" 
ON public.guardians 
FOR SELECT 
USING (id = auth.uid());

CREATE POLICY "Admins can view all guardians" 
ON public.guardians 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can update their own profile" 
ON public.guardians 
FOR UPDATE 
USING (id = auth.uid());

CREATE POLICY "Admins can manage all guardians" 
ON public.guardians 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Enable RLS on teams if not already enabled
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

-- Teams table policies
CREATE POLICY "Anyone can view teams" 
ON public.teams 
FOR SELECT 
USING (true);

CREATE POLICY "Coaches can view their assigned teams" 
ON public.teams 
FOR SELECT 
USING (public.has_team_role(auth.uid(), 'coach', id));

CREATE POLICY "Managers can view their assigned teams" 
ON public.teams 
FOR SELECT 
USING (public.has_team_role(auth.uid(), 'manager', id));

CREATE POLICY "Admins can manage teams" 
ON public.teams 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Enable RLS on players if not already enabled
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;

-- Players table policies
CREATE POLICY "Parents can view their children" 
ON public.players 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.guardians g 
    WHERE g.id = auth.uid() AND g.player_id = id
  )
);

CREATE POLICY "Coaches can view players in their teams" 
ON public.players 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.player_teams pt
    WHERE pt.player_id = id 
      AND public.has_team_role(auth.uid(), 'coach', pt.team_id)
  )
);

CREATE POLICY "Managers can view players in their teams" 
ON public.players 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.player_teams pt
    WHERE pt.player_id = id 
      AND public.has_team_role(auth.uid(), 'manager', pt.team_id)
  )
);

CREATE POLICY "Admins can view all players" 
ON public.players 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Parents can update their children" 
ON public.players 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.guardians g 
    WHERE g.id = auth.uid() AND g.player_id = id
  )
);

CREATE POLICY "Admins can manage all players" 
ON public.players 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Enable RLS on events if not already enabled
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Events table policies
CREATE POLICY "Anyone can view events" 
ON public.events 
FOR SELECT 
USING (true);

CREATE POLICY "Coaches can manage their team events" 
ON public.events 
FOR ALL 
USING (public.has_team_role(auth.uid(), 'coach', team_id));

CREATE POLICY "Managers can manage their team events" 
ON public.events 
FOR ALL 
USING (public.has_team_role(auth.uid(), 'manager', team_id));

CREATE POLICY "Admins can manage all events" 
ON public.events 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Enable RLS on event_responses if not already enabled
ALTER TABLE public.event_responses ENABLE ROW LEVEL SECURITY;

-- Event responses policies
CREATE POLICY "Parents can manage responses for their children" 
ON public.event_responses 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.guardians g 
    WHERE g.id = auth.uid() AND g.player_id = player_id
  )
);

CREATE POLICY "Coaches can view responses for their team events" 
ON public.event_responses 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.events e
    WHERE e.id = event_id 
      AND public.has_team_role(auth.uid(), 'coach', e.team_id)
  )
);

CREATE POLICY "Managers can view responses for their team events" 
ON public.event_responses 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.events e
    WHERE e.id = event_id 
      AND public.has_team_role(auth.uid(), 'manager', e.team_id)
  )
);

CREATE POLICY "Coaches can update attendance for their team events" 
ON public.event_responses 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.events e
    WHERE e.id = event_id 
      AND public.has_team_role(auth.uid(), 'coach', e.team_id)
  )
);

CREATE POLICY "Managers can update attendance for their team events" 
ON public.event_responses 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.events e
    WHERE e.id = event_id 
      AND public.has_team_role(auth.uid(), 'manager', e.team_id)
  )
);

CREATE POLICY "Admins can manage all event responses" 
ON public.event_responses 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Insert default admin role (replace with actual guardian ID)
-- This will need to be updated with real guardian IDs after authentication is set up
-- INSERT INTO public.user_roles (guardian_id, role) 
-- VALUES ('your-guardian-id-here', 'admin');