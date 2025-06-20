
-- Create enum for member types
CREATE TYPE public.team_member_type AS ENUM ('parent', 'coach', 'manager', 'admin');

-- Create the unified team_members table
CREATE TABLE public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES public.guardians(id) ON DELETE CASCADE,
  member_type public.team_member_type NOT NULL,
  player_id UUID REFERENCES public.players(id) ON DELETE CASCADE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  assigned_by UUID REFERENCES public.guardians(id),
  
  -- Ensure unique active memberships per team/member/type combination
  UNIQUE(team_id, member_id, member_type, player_id),
  
  -- Check constraint: player_id is required for parents, optional for staff
  CONSTRAINT check_parent_has_player CHECK (
    (member_type = 'parent' AND player_id IS NOT NULL) OR 
    (member_type IN ('coach', 'manager', 'admin') AND player_id IS NULL)
  )
);

-- Add indexes for better query performance
CREATE INDEX idx_team_members_team_id ON public.team_members(team_id);
CREATE INDEX idx_team_members_member_id ON public.team_members(member_id);
CREATE INDEX idx_team_members_player_id ON public.team_members(player_id) WHERE player_id IS NOT NULL;
CREATE INDEX idx_team_members_type_active ON public.team_members(member_type, is_active);

-- Enable RLS
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can see team members for teams they have access to
CREATE POLICY "Users can view team members for accessible teams" 
ON public.team_members 
FOR SELECT 
USING (
  public.can_access_team(team_id)
);

-- RLS Policy: Admins and managers can insert team members
CREATE POLICY "Admins and managers can add team members" 
ON public.team_members 
FOR INSERT 
WITH CHECK (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_team_role(auth.uid(), 'manager', team_id)
);

-- RLS Policy: Admins and managers can update team members
CREATE POLICY "Admins and managers can update team members" 
ON public.team_members 
FOR UPDATE 
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_team_role(auth.uid(), 'manager', team_id)
);

-- RLS Policy: Admins and managers can delete team members
CREATE POLICY "Admins and managers can delete team members" 
ON public.team_members 
FOR DELETE 
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_team_role(auth.uid(), 'manager', team_id)
);

-- Migrate existing data from user_roles (staff) - using CASE for type conversion
INSERT INTO public.team_members (team_id, member_id, member_type, is_active, assigned_at, assigned_by)
SELECT 
  ur.team_id,
  ur.guardian_id,
  CASE 
    WHEN ur.role = 'coach' THEN 'coach'::public.team_member_type
    WHEN ur.role = 'manager' THEN 'manager'::public.team_member_type
    WHEN ur.role = 'admin' THEN 'admin'::public.team_member_type
  END as member_type,
  ur.is_active,
  ur.assigned_at,
  ur.assigned_by
FROM public.user_roles ur
WHERE ur.team_id IS NOT NULL 
  AND ur.role IN ('coach', 'manager', 'admin')
  AND ur.is_active = true;

-- Migrate existing parent relationships
INSERT INTO public.team_members (team_id, member_id, member_type, player_id, is_active, assigned_at)
SELECT DISTINCT
  pt.team_id,
  g.id as guardian_id,
  'parent'::public.team_member_type,
  p.id as player_id,
  true,
  COALESCE(pt.join_date::timestamp with time zone, now())
FROM public.player_teams pt
JOIN public.players p ON p.id = pt.player_id
JOIN public.guardians g ON g.player_id = p.id
WHERE g.approval_status = 'approved'
  AND p.approval_status = 'approved'
ON CONFLICT (team_id, member_id, member_type, player_id) DO NOTHING;

-- Also migrate from player_guardians if it has data
INSERT INTO public.team_members (team_id, member_id, member_type, player_id, is_active, assigned_at)
SELECT DISTINCT
  pt.team_id,
  pg.guardian_id,
  'parent'::public.team_member_type,
  pg.player_id,
  true,
  COALESCE(pt.join_date::timestamp with time zone, now())
FROM public.player_teams pt
JOIN public.player_guardians pg ON pg.player_id = pt.player_id
JOIN public.guardians g ON g.id = pg.guardian_id
WHERE g.approval_status = 'approved'
ON CONFLICT (team_id, member_id, member_type, player_id) DO NOTHING;
