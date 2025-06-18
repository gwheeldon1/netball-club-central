
-- Fix the admin role assignment by working with the existing guardian ID
-- and ensuring the auth context can find the roles properly

DO $$
DECLARE
    gavin_auth_id UUID;
    gavin_guardian_id UUID;
BEGIN
    -- Get the auth user ID for Gavin
    SELECT id INTO gavin_auth_id 
    FROM auth.users 
    WHERE email = 'gavin@thewheeldons.net' 
    LIMIT 1;
    
    -- Get the guardian ID for Gavin
    SELECT id INTO gavin_guardian_id 
    FROM public.guardians 
    WHERE email = 'gavin@thewheeldons.net' 
    LIMIT 1;
    
    -- Remove any existing admin roles for this guardian to avoid conflicts
    DELETE FROM public.user_roles 
    WHERE guardian_id = gavin_guardian_id AND role = 'admin';
    
    -- Add the admin role using the guardian ID (not auth ID)
    IF gavin_guardian_id IS NOT NULL THEN
        INSERT INTO public.user_roles (guardian_id, role, assigned_by, is_active) 
        VALUES (gavin_guardian_id, 'admin', gavin_guardian_id, true);
        
        RAISE NOTICE 'Admin role assigned to guardian ID: %', gavin_guardian_id;
    ELSE
        RAISE NOTICE 'Guardian with email gavin@thewheeldons.net not found';
    END IF;
    
    -- Debug output
    RAISE NOTICE 'Auth user ID: %, Guardian ID: %', gavin_auth_id, gavin_guardian_id;
END $$;
