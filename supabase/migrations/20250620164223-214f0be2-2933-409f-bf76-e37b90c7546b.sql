
-- Populate guardians_teams table with existing relationships
INSERT INTO public.guardians_teams (guardian_id, team_id, player_id)
SELECT DISTINCT g.id, pt.team_id, pt.player_id
FROM public.player_teams pt
JOIN public.guardians g ON g.player_id = pt.player_id
WHERE g.approval_status = 'approved'
ON CONFLICT (guardian_id, team_id, player_id) DO NOTHING;

-- Verify the data was inserted
SELECT 
  gt.id,
  t.name as team_name,
  g.first_name || ' ' || g.last_name as guardian_name,
  p.first_name || ' ' || p.last_name as player_name
FROM public.guardians_teams gt
JOIN public.teams t ON t.id = gt.team_id
JOIN public.guardians g ON g.id = gt.guardian_id
JOIN public.players p ON p.id = gt.player_id
ORDER BY t.name, g.first_name;
