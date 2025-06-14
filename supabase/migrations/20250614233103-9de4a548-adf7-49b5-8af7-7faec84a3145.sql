-- Add unique constraint for guardian_id and role combination if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'user_roles_guardian_role_unique'
    ) THEN
        ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_guardian_role_unique UNIQUE (guardian_id, role);
    END IF;
END $$;

-- First, ensure the user has admin role to access the system
INSERT INTO public.user_roles (guardian_id, role, assigned_by, is_active) 
VALUES ('82e0de72-534b-4a0d-9379-05b86a29f2c5', 'admin', '82e0de72-534b-4a0d-9379-05b86a29f2c5', true)
ON CONFLICT (guardian_id, role) DO NOTHING;

-- Enable RLS on user_roles table if not already enabled
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;