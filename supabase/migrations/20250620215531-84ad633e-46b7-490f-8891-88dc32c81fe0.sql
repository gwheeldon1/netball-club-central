
-- Update all guardians to approved status
UPDATE public.guardians 
SET approval_status = 'approved', 
    approved_at = now(),
    approved_by = (SELECT id FROM public.guardians WHERE email LIKE '%admin%' LIMIT 1)
WHERE approval_status != 'approved';

-- Update all players to approved status as well
UPDATE public.players 
SET approval_status = 'approved', 
    approved_at = now(),
    approved_by = (SELECT id FROM public.guardians WHERE email LIKE '%admin%' LIMIT 1)
WHERE approval_status != 'approved';

-- Now populate the guardians_teams table with the approved guardians
INSERT INTO public.guardians_teams (guardian_id, team_id, player_id)
SELECT DISTINCT 
    COALESCE(g.id, pg.guardian_id) as guardian_id,
    pt.team_id,
    pt.player_id
FROM public.player_teams pt
LEFT JOIN public.guardians g ON g.player_id = pt.player_id AND g.approval_status = 'approved'
LEFT JOIN public.player_guardians pg ON pg.player_id = pt.player_id
LEFT JOIN public.guardians g2 ON g2.id = pg.guardian_id AND g2.approval_status = 'approved'
WHERE (g.id IS NOT NULL OR (pg.guardian_id IS NOT NULL AND g2.id IS NOT NULL))
ON CONFLICT (guardian_id, team_id, player_id) DO NOTHING;

-- Show final counts
SELECT 'Final approved guardians' as description, count(*) as count 
FROM public.guardians WHERE approval_status = 'approved'
UNION ALL
SELECT 'Final approved players', count(*) 
FROM public.players WHERE approval_status = 'approved'
UNION ALL
SELECT 'Guardian-team relationships created', count(*) 
FROM public.guardians_teams;
