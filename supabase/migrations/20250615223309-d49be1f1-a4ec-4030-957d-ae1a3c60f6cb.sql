
-- Add archived column to teams table (if not already added)
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS archived boolean NOT NULL DEFAULT false;

-- Make gavin@thewheeldons.net an admin
-- First, let's find the guardian ID for this email
DO $$
DECLARE
    target_guardian_id UUID;
BEGIN
    -- Find the guardian with this email
    SELECT id INTO target_guardian_id 
    FROM public.guardians 
    WHERE email = 'gavin@thewheeldons.net' 
    LIMIT 1;
    
    -- If guardian exists, add admin role
    IF target_guardian_id IS NOT NULL THEN
        INSERT INTO public.user_roles (guardian_id, role, assigned_by, is_active) 
        VALUES (target_guardian_id, 'admin', target_guardian_id, true)
        ON CONFLICT (guardian_id, role) DO UPDATE SET is_active = true;
    ELSE
        RAISE NOTICE 'Guardian with email gavin@thewheeldons.net not found';
    END IF;
END $$;
