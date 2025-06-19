
-- Create permissions table for granular permissions
CREATE TABLE public.permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE, -- e.g., 'teams.view.all', 'events.create'
  description TEXT,
  category TEXT NOT NULL, -- e.g., 'teams', 'events', 'users'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create role_permissions junction table
CREATE TABLE public.role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role user_role NOT NULL,
  permission_id UUID REFERENCES public.permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(role, permission_id)
);

-- Insert granular permissions
INSERT INTO public.permissions (name, description, category) VALUES
-- Team permissions
('teams.view.all', 'View all teams in the system', 'teams'),
('teams.view.assigned', 'View only assigned teams', 'teams'),
('teams.view.children', 'View teams where user has children', 'teams'),
('teams.create', 'Create new teams', 'teams'),
('teams.edit.all', 'Edit any team', 'teams'),
('teams.edit.assigned', 'Edit only assigned teams', 'teams'),
('teams.delete', 'Delete teams', 'teams'),

-- Event permissions
('events.view.all', 'View all events', 'events'),
('events.view.assigned', 'View events for assigned teams', 'events'),
('events.view.children', 'View events for teams with children', 'events'),
('events.create', 'Create new events', 'events'),
('events.edit.all', 'Edit any event', 'events'),
('events.edit.assigned', 'Edit events for assigned teams', 'events'),
('events.delete', 'Delete events', 'events'),

-- User management permissions
('users.view.all', 'View all users', 'users'),
('users.edit.all', 'Edit any user', 'users'),
('users.delete', 'Delete users', 'users'),
('roles.assign', 'Assign roles to users', 'roles'),
('roles.manage', 'Create and manage role definitions', 'roles'),

-- Group permissions
('groups.view.all', 'View all groups', 'groups'),
('groups.create', 'Create new groups', 'groups'),
('groups.edit.all', 'Edit any group', 'groups'),
('groups.delete', 'Delete groups', 'groups'),

-- Analytics permissions
('analytics.view.all', 'View all analytics', 'analytics'),
('analytics.view.assigned', 'View analytics for assigned teams', 'analytics'),

-- System permissions
('settings.manage', 'Manage system settings', 'system'),
('approvals.manage', 'Manage user approvals', 'system');

-- Assign permissions to existing roles
-- Admin gets all permissions
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'admin', id FROM public.permissions;

-- Manager gets team and event management for assigned teams
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'manager', id FROM public.permissions 
WHERE name IN (
  'teams.view.assigned', 'teams.edit.assigned',
  'events.view.assigned', 'events.create', 'events.edit.assigned',
  'analytics.view.assigned', 'approvals.manage'
);

-- Coach gets similar permissions to manager but no user approvals
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'coach', id FROM public.permissions 
WHERE name IN (
  'teams.view.assigned', 
  'events.view.assigned', 'events.create', 'events.edit.assigned',
  'analytics.view.assigned'
);

-- Parent gets basic view permissions for their children's teams
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'parent', id FROM public.permissions 
WHERE name IN (
  'teams.view.children', 'events.view.children'
);

-- Create function to get user permissions with context
CREATE OR REPLACE FUNCTION public.get_user_permissions(user_id UUID)
RETURNS TABLE(permission_name TEXT) 
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT DISTINCT p.name
  FROM public.user_roles ur
  JOIN public.role_permissions rp ON rp.role = ur.role
  JOIN public.permissions p ON p.id = rp.permission_id
  WHERE ur.guardian_id = user_id 
    AND ur.is_active = true;
$$;

-- Create function to check specific permission
CREATE OR REPLACE FUNCTION public.has_permission(user_id UUID, permission_name TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.get_user_permissions(user_id) 
    WHERE permission_name = $2
  );
$$;

-- Create function to get user's accessible teams
CREATE OR REPLACE FUNCTION public.get_accessible_teams(user_id UUID)
RETURNS TABLE(team_id UUID)
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  -- Admin can see all teams
  SELECT t.id FROM public.teams t
  WHERE public.has_permission(user_id, 'teams.view.all')
  
  UNION
  
  -- Users with assigned team permissions see their assigned teams
  SELECT ur.team_id FROM public.user_roles ur
  WHERE ur.guardian_id = user_id 
    AND ur.is_active = true 
    AND ur.team_id IS NOT NULL
    AND public.has_permission(user_id, 'teams.view.assigned')
  
  UNION
  
  -- Parents see teams where they have children
  SELECT pt.team_id FROM public.player_teams pt
  JOIN public.guardians g ON g.player_id = pt.player_id
  WHERE g.id = user_id
    AND public.has_permission(user_id, 'teams.view.children');
$$;

-- Enable RLS on new tables
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- RLS policies for permissions (admin only)
CREATE POLICY "Admins can manage permissions" 
ON public.permissions FOR ALL 
USING (public.has_permission(auth.uid(), 'roles.manage'));

CREATE POLICY "Users can view permissions" 
ON public.permissions FOR SELECT 
USING (true);

-- RLS policies for role_permissions (admin only)
CREATE POLICY "Admins can manage role permissions" 
ON public.role_permissions FOR ALL 
USING (public.has_permission(auth.uid(), 'roles.manage'));

CREATE POLICY "Users can view role permissions" 
ON public.role_permissions FOR SELECT 
USING (true);
