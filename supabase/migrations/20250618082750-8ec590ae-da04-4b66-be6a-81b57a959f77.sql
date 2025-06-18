
-- Check if we have guardians with the names you mentioned
SELECT id, first_name, last_name, email FROM public.guardians 
WHERE (first_name ILIKE '%Gavin%' AND last_name ILIKE '%Wheeldon%') 
   OR (first_name ILIKE '%Linda%' AND last_name ILIKE '%Charlton%');

-- Check what user roles exist in the system
SELECT ur.id, ur.guardian_id, ur.role, ur.team_id, ur.is_active,
       g.first_name, g.last_name, g.email,
       t.name as team_name
FROM public.user_roles ur
LEFT JOIN public.guardians g ON g.id = ur.guardian_id
LEFT JOIN public.teams t ON t.id = ur.team_id
WHERE ur.role IN ('coach', 'manager', 'admin')
  AND ur.is_active = true
ORDER BY ur.role, g.first_name;

-- Check the specific team (Thunder) and its ID
SELECT id, name, age_group FROM public.teams 
WHERE name ILIKE '%Thunder%';

-- Check if there are any user roles for the Thunder team specifically
SELECT ur.id, ur.guardian_id, ur.role, ur.team_id, ur.is_active,
       g.first_name, g.last_name, g.email
FROM public.user_roles ur
JOIN public.guardians g ON g.id = ur.guardian_id
JOIN public.teams t ON t.id = ur.team_id
WHERE t.name ILIKE '%Thunder%'
  AND ur.role IN ('coach', 'manager', 'admin')
  AND ur.is_active = true;
