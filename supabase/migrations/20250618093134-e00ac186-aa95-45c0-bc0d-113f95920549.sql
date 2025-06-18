
-- First, create the user_has_role function if it doesn't exist
CREATE OR REPLACE FUNCTION public.user_has_role(user_id uuid, check_role user_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
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

-- Create groups table
CREATE TABLE public.groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  avatar_image TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add group_id to teams table
ALTER TABLE public.teams 
ADD COLUMN group_id UUID REFERENCES public.groups(id);

-- Create group_staff junction table for staff assignments
CREATE TABLE public.group_staff (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  guardian_id UUID NOT NULL REFERENCES public.guardians(id) ON DELETE CASCADE,
  role user_role NOT NULL,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(group_id, guardian_id, role)
);

-- Enable RLS on new tables
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_staff ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies for groups (adjust based on your auth requirements)
CREATE POLICY "Groups are viewable by authenticated users" 
  ON public.groups FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Admins can manage groups" 
  ON public.groups FOR ALL 
  TO authenticated 
  USING (public.user_has_role(auth.uid(), 'admin'::user_role));

-- RLS policies for group_staff
CREATE POLICY "Group staff viewable by authenticated users" 
  ON public.group_staff FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Admins can manage group staff" 
  ON public.group_staff FOR ALL 
  TO authenticated 
  USING (public.user_has_role(auth.uid(), 'admin'::user_role));

-- Create trigger for updating groups updated_at
CREATE OR REPLACE FUNCTION public.update_groups_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_groups_updated_at
  BEFORE UPDATE ON public.groups
  FOR EACH ROW
  EXECUTE FUNCTION public.update_groups_updated_at();

-- Insert sample groups based on age groups from existing teams
INSERT INTO public.groups (name, description) VALUES
  ('Under 7', 'Teams for players under 7 years old'),
  ('Under 8', 'Teams for players under 8 years old'),
  ('Under 9', 'Teams for players under 9 years old'),
  ('Under 10', 'Teams for players under 10 years old'),
  ('Under 11', 'Teams for players under 11 years old'),
  ('Under 12', 'Teams for players under 12 years old'),
  ('Under 13', 'Teams for players under 13 years old'),
  ('Under 14', 'Teams for players under 14 years old'),
  ('Under 15', 'Teams for players under 15 years old'),
  ('Under 16', 'Teams for players under 16 years old'),
  ('Under 17', 'Teams for players under 17 years old'),
  ('Under 18', 'Teams for players under 18 years old');

-- Update existing teams to associate them with groups based on age_group
UPDATE public.teams 
SET group_id = (
  SELECT g.id 
  FROM public.groups g 
  WHERE LOWER(g.name) = LOWER(REPLACE(teams.age_group, 'U', 'Under '))
  LIMIT 1
);
