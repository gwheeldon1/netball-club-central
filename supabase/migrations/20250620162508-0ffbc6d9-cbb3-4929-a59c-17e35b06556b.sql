
-- First, let's see the current state of team members, players, and guardians
SELECT 'Team Members' as table_name, count(*) as total_count FROM team_members
UNION ALL
SELECT 'Players', count(*) FROM players
UNION ALL  
SELECT 'Guardians', count(*) FROM guardians
UNION ALL
SELECT 'Player Teams', count(*) FROM player_teams;

-- Check current approval statuses
SELECT 'Players - Pending' as status_type, count(*) as count FROM players WHERE approval_status = 'pending'
UNION ALL
SELECT 'Players - Approved', count(*) FROM players WHERE approval_status = 'approved'
UNION ALL
SELECT 'Guardians - Pending', count(*) FROM guardians WHERE approval_status = 'pending'
UNION ALL
SELECT 'Guardians - Approved', count(*) FROM guardians WHERE approval_status = 'approved';

-- Show parent-team relationships from team_members table
SELECT 
  t.name as team_name,
  g.first_name || ' ' || g.last_name as parent_name,
  g.email as parent_email,
  p.first_name || ' ' || p.last_name as child_name,
  tm.member_type,
  tm.is_active
FROM team_members tm
JOIN teams t ON t.id = tm.team_id
JOIN guardians g ON g.id = tm.member_id
LEFT JOIN players p ON p.id = tm.player_id
WHERE tm.member_type = 'parent'
ORDER BY t.name, g.first_name;

-- Show fallback parent-team relationships via player_teams
SELECT 
  t.name as team_name,
  g.first_name || ' ' || g.last_name as parent_name,
  g.email as parent_email,
  p.first_name || ' ' || p.last_name as child_name,
  'via player_teams' as source
FROM player_teams pt
JOIN teams t ON t.id = pt.team_id
JOIN players p ON p.id = pt.player_id
JOIN guardians g ON g.player_id = p.id
ORDER BY t.name, g.first_name;

-- Update all players to approved status
UPDATE players 
SET approval_status = 'approved', 
    approved_at = now(),
    approved_by = (SELECT id FROM guardians WHERE email LIKE '%admin%' LIMIT 1)
WHERE approval_status != 'approved';

-- Update all guardians to approved status  
UPDATE guardians 
SET approval_status = 'approved',
    approved_at = now(),
    approved_by = (SELECT id FROM guardians WHERE email LIKE '%admin%' LIMIT 1)
WHERE approval_status != 'approved';

-- Show final counts after approval updates
SELECT 'Final Players - Approved' as status_type, count(*) as count FROM players WHERE approval_status = 'approved'
UNION ALL
SELECT 'Final Guardians - Approved', count(*) FROM guardians WHERE approval_status = 'approved';
