
-- Make Gavin Wheeldon an admin by finding his guardian record and assigning the admin role
DO $$
DECLARE
    gavin_guardian_id UUID;
BEGIN
    -- Find Gavin's guardian ID by email
    SELECT id INTO gavin_guardian_id 
    FROM public.guardians 
    WHERE email = 'gavin@thewheeldons.net' 
    LIMIT 1;
    
    -- If guardian exists, add admin role
    IF gavin_guardian_id IS NOT NULL THEN
        INSERT INTO public.user_roles (guardian_id, role, assigned_by, is_active) 
        VALUES (gavin_guardian_id, 'admin', gavin_guardian_id, true)
        ON CONFLICT (guardian_id, role) DO UPDATE SET 
            is_active = true,
            assigned_at = now();
        
        RAISE NOTICE 'Admin role assigned to Gavin Wheeldon (ID: %)', gavin_guardian_id;
    ELSE
        RAISE NOTICE 'Guardian with email gavin@thewheeldons.net not found';
    END IF;
END $$;
