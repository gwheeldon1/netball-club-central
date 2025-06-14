-- Create function to handle forgot password for guardians
CREATE OR REPLACE FUNCTION public.handle_guardian_forgot_password(guardian_email TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  guardian_record guardians%ROWTYPE;
  auth_user_id UUID;
  temp_password TEXT;
  result JSON;
BEGIN
  -- Check if guardian exists with this email
  SELECT * INTO guardian_record
  FROM public.guardians
  WHERE email = guardian_email;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'message', 'No account found with this email address');
  END IF;
  
  -- Generate a temporary password (user will need to change it)
  temp_password := 'TempPass' || floor(random() * 9000 + 1000)::text;
  
  -- Create auth user
  INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_user_meta_data,
    raw_app_meta_data,
    is_super_admin,
    role
  ) VALUES (
    guardian_record.id, -- Use existing guardian ID
    guardian_email,
    crypt(temp_password, gen_salt('bf')), -- Hash the temporary password
    now(), -- Auto-confirm email since they're already in our system
    now(),
    now(),
    json_build_object(
      'first_name', guardian_record.first_name,
      'last_name', guardian_record.last_name
    ),
    '{}',
    false,
    'authenticated'
  );
  
  -- Return success with temporary password
  RETURN json_build_object(
    'success', true, 
    'message', 'Account created successfully. Please use the temporary password to log in and change it immediately.',
    'temp_password', temp_password
  );
  
EXCEPTION
  WHEN unique_violation THEN
    -- Auth user already exists, send password reset instead
    RETURN json_build_object(
      'success', true,
      'message', 'Account already exists. A password reset email will be sent if the account is found.',
      'send_reset', true
    );
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'message', 'An error occurred. Please try again.');
END;
$$;