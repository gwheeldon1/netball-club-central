
-- First, let's see what data we actually have
SELECT 'Step 1: Total players in Flame team' as step, count(*) as count
FROM public.player_teams pt 
WHERE pt.team_id = '79f98363-7555-4fbb-b542-07d5824a0fc6';

-- Check if there are any guardians at all
SELECT 'Step 2: Total guardians' as step, count(*) as count
FROM public.guardians;

-- Check guardians approval status
SELECT 'Step 3: Guardian approval status' as step, approval_status, count(*) as count
FROM public.guardians 
GROUP BY approval_status;

-- Check if guardians have player_id set
SELECT 'Step 4: Guardians with player_id' as step, 
       CASE WHEN player_id IS NOT NULL THEN 'Has player_id' ELSE 'No player_id' END as status,
       count(*) as count
FROM public.guardians 
GROUP BY CASE WHEN player_id IS NOT NULL THEN 'Has player_id' ELSE 'No player_id' END;

-- Try to find the actual relationship - maybe it's through a different table
SELECT 'Step 5: Check player_guardians table' as step, count(*) as count
FROM public.player_guardians;

-- Now try the insert with any approved guardians (not just ones with player_id)
INSERT INTO public.guardians_teams (guardian_id, team_id, player_id)
SELECT DISTINCT 
    COALESCE(g.id, pg.guardian_id) as guardian_id,
    pt.team_id,
    pt.player_id
FROM public.player_teams pt
LEFT JOIN public.guardians g ON g.player_id = pt.player_id AND g.approval_status = 'approved'
LEFT JOIN public.player_guardians pg ON pg.player_id = pt.player_id
LEFT JOIN public.guardians g2 ON g2.id = pg.guardian_id AND g2.approval_status = 'approved'
WHERE pt.team_id = '79f98363-7555-4fbb-b542-07d5824a0fc6'
  AND (g.id IS NOT NULL OR (pg.guardian_id IS NOT NULL AND g2.id IS NOT NULL))
ON CONFLICT (guardian_id, team_id, player_id) DO NOTHING;

-- Check how many records we inserted
SELECT 'Step 6: Records in guardians_teams after insert' as step, count(*) as count
FROM public.guardians_teams;
