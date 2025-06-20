
-- Diagnostic queries to understand the data structure

-- Check total guardians and their approval status
SELECT 'Total Guardians' as description, count(*) as count FROM public.guardians
UNION ALL
SELECT 'Approved Guardians', count(*) FROM public.guardians WHERE approval_status = 'approved'
UNION ALL
SELECT 'Guardians with player_id', count(*) FROM public.guardians WHERE player_id IS NOT NULL;

-- Check how guardians are linked to the Flame team players
SELECT 
  p.first_name || ' ' || p.last_name as player_name,
  g.first_name || ' ' || g.last_name as guardian_name,
  g.approval_status,
  g.player_id,
  pt.team_id
FROM public.player_teams pt
JOIN public.players p ON p.id = pt.player_id
LEFT JOIN public.guardians g ON g.player_id = p.id
WHERE pt.team_id = '79f98363-7555-4fbb-b542-07d5824a0fc6'
ORDER BY p.first_name;

-- Check current guardians_teams records
SELECT count(*) as guardians_teams_count FROM public.guardians_teams;

-- Show what would be inserted (dry run of our insert query)
SELECT DISTINCT 
  g.id as guardian_id,
  pt.team_id,
  pt.player_id,
  g.first_name || ' ' || g.last_name as guardian_name,
  p.first_name || ' ' || p.last_name as player_name,
  g.approval_status
FROM public.player_teams pt
JOIN public.guardians g ON g.player_id = pt.player_id
JOIN public.players p ON p.id = pt.player_id
WHERE pt.team_id = '79f98363-7555-4fbb-b542-07d5824a0fc6';
