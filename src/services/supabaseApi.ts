import { supabase } from '@/integrations/supabase/client';
import { User, Child, Team, Event, Attendance, UserRole } from '@/types';

/**
 * Supabase API service that replaces the mock localStorage API
 */

// Helper function to map Supabase players to Child type
const mapPlayerToChild = (player: any, teamId?: string): Child => ({
  id: player.id,
  name: `${player.first_name} ${player.last_name}`,
  dateOfBirth: player.date_of_birth || '',
  medicalInfo: '', // Not in Supabase schema
  notes: '', // Not in Supabase schema
  profileImage: '', // Not in Supabase schema
  teamId: teamId || '',
  ageGroup: '', // Will be derived from team
  parentId: '', // Will be populated from guardians
  status: 'approved' as const, // Default to approved since no status in Supabase
});

// Helper function to map Supabase teams to Team type
const mapTeamToTeam = (team: any): Team => ({
  id: team.id,
  name: team.name,
  ageGroup: team.age_group,
  category: 'Junior' as const, // Default category
  profileImage: '', // Not in Supabase schema
  bannerImage: '', // Not in Supabase schema
  icon: '', // Not in Supabase schema
  description: '', // Not in Supabase schema
});

// Helper function to map Supabase guardians to User type
const mapGuardianToUser = (guardian: any): User => ({
  id: guardian.id,
  name: `${guardian.first_name} ${guardian.last_name}`,
  email: guardian.email || '',
  phone: guardian.phone?.toString() || '',
  profileImage: '',
  roles: guardian.user_roles?.filter((ur: any) => ur.is_active).map((ur: any) => ur.role) || ['parent'],
});

/**
 * Children API functions using Supabase
 */
export const supabaseChildrenApi = {
  getAll: async (): Promise<Child[]> => {
    const { data: players, error } = await supabase
      .from('players')
      .select(`
        *,
        player_teams (
          team_id,
          teams (
            id,
            name,
            age_group
          )
        )
      `);
    
    if (error) throw error;
    
    return players?.map(player => {
      const teamAssignment = player.player_teams?.[0];
      return {
        ...mapPlayerToChild(player, teamAssignment?.team_id),
        ageGroup: teamAssignment?.teams?.age_group || '',
      };
    }) || [];
  },

  getById: async (id: string): Promise<Child | undefined> => {
    const { data: player, error } = await supabase
      .from('players')
      .select(`
        *,
        player_teams (
          team_id,
          teams (
            id,
            name,
            age_group
          )
        )
      `)
      .eq('id', id)
      .single();
    
    if (error || !player) return undefined;
    
    const teamAssignment = player.player_teams?.[0];
    return {
      ...mapPlayerToChild(player, teamAssignment?.team_id),
      ageGroup: teamAssignment?.teams?.age_group || '',
    };
  },

  getByParentId: async (parentId: string): Promise<Child[]> => {
    const { data: guardians, error } = await supabase
      .from('guardians')
      .select(`
        player_id,
        players (
          *,
          player_teams (
            team_id,
            teams (
              id,
              name,
              age_group
            )
          )
        )
      `)
      .eq('id', parentId);
    
    if (error) throw error;
    
    return guardians?.map(guardian => {
      const player = guardian.players;
      const teamAssignment = player?.player_teams?.[0];
      return {
        ...mapPlayerToChild(player, teamAssignment?.team_id),
        ageGroup: teamAssignment?.teams?.age_group || '',
        parentId,
      };
    }) || [];
  },

  getByTeamId: async (teamId: string): Promise<Child[]> => {
    const { data: playerTeams, error } = await supabase
      .from('player_teams')
      .select(`
        players (
          *
        ),
        teams (
          age_group
        )
      `)
      .eq('team_id', teamId);
    
    if (error) throw error;
    
    return playerTeams?.map(pt => ({
      ...mapPlayerToChild(pt.players, teamId),
      ageGroup: pt.teams?.age_group || '',
    })) || [];
  },

  create: async (child: Omit<Child, 'id'>): Promise<Child> => {
    const [firstName, ...lastNameParts] = child.name.split(' ');
    const lastName = lastNameParts.join(' ');
    
    const { data: player, error } = await supabase
      .from('players')
      .insert({
        first_name: firstName,
        last_name: lastName,
        date_of_birth: child.dateOfBirth,
      })
      .select()
      .single();
    
    if (error) throw error;
    
    // If teamId is provided, create player_teams relationship
    if (child.teamId) {
      await supabase
        .from('player_teams')
        .insert({
          player_id: player.id,
          team_id: child.teamId,
        });
    }
    
    return mapPlayerToChild(player, child.teamId);
  },

  update: async (id: string, child: Partial<Child>): Promise<Child | undefined> => {
    const updates: any = {};
    
    if (child.name) {
      const [firstName, ...lastNameParts] = child.name.split(' ');
      updates.first_name = firstName;
      updates.last_name = lastNameParts.join(' ');
    }
    
    if (child.dateOfBirth) {
      updates.date_of_birth = child.dateOfBirth;
    }
    
    const { data: player, error } = await supabase
      .from('players')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error || !player) return undefined;
    
    return mapPlayerToChild(player);
  },
};

/**
 * Team API functions using Supabase
 */
export const supabaseTeamApi = {
  getAll: async (): Promise<Team[]> => {
    const { data: teams, error } = await supabase
      .from('teams')
      .select('*');
    
    if (error) throw error;
    
    return teams?.map(mapTeamToTeam) || [];
  },

  getById: async (id: string): Promise<Team | undefined> => {
    const { data: team, error } = await supabase
      .from('teams')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !team) return undefined;
    
    return mapTeamToTeam(team);
  },

  create: async (team: Omit<Team, 'id'>): Promise<Team> => {
    const { data: newTeam, error } = await supabase
      .from('teams')
      .insert({
        name: team.name,
        age_group: team.ageGroup,
        season_year: new Date().getFullYear(),
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return mapTeamToTeam(newTeam);
  },
};

/**
 * User API functions using Supabase (Guardians)
 */
export const supabaseUserApi = {
  getAll: async (): Promise<User[]> => {
    const { data: guardians, error } = await supabase
      .from('guardians')
      .select(`
        *,
        user_roles (
          role,
          team_id,
          is_active
        )
      `);
    
    if (error) throw error;
    
    return guardians?.map(mapGuardianToUser) || [];
  },

  getById: async (id: string): Promise<User | undefined> => {
    const { data: guardian, error } = await supabase
      .from('guardians')
      .select(`
        *,
        user_roles (
          role,
          team_id,
          is_active
        )
      `)
      .eq('id', id)
      .single();
    
    if (error || !guardian) return undefined;
    
    return mapGuardianToUser(guardian);
  },

  getByEmail: async (email: string): Promise<User | undefined> => {
    const { data: guardian, error } = await supabase
      .from('guardians')
      .select(`
        *,
        user_roles (
          role,
          team_id,
          is_active
        )
      `)
      .eq('email', email)
      .single();
    
    if (error || !guardian) return undefined;
    
    return mapGuardianToUser(guardian);
  },

  getCurrentUser: async (): Promise<User | undefined> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return undefined;
    
    return supabaseUserApi.getById(user.id);
  },
};

/**
 * Role management API functions
 */
export const supabaseRoleApi = {
  getUserRoles: async (userId: string): Promise<{ role: string; teamId?: string; isActive: boolean }[]> => {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role, team_id, is_active')
      .eq('guardian_id', userId);
    
    if (error) throw error;
    
    return data?.map(role => ({
      role: role.role,
      teamId: role.team_id,
      isActive: role.is_active
    })) || [];
  },

  assignRole: async (userId: string, role: UserRole, teamId?: string): Promise<void> => {
    const { error } = await supabase
      .from('user_roles')
      .insert({
        guardian_id: userId,
        role: role as any,
        team_id: teamId,
        assigned_by: (await supabase.auth.getUser()).data.user?.id
      });
    
    if (error) throw error;
  },

  removeRole: async (userId: string, role: UserRole, teamId?: string): Promise<void> => {
    let query = supabase
      .from('user_roles')
      .update({ is_active: false })
      .eq('guardian_id', userId)
      .eq('role', role as any);
    
    if (teamId) {
      query = query.eq('team_id', teamId);
    }
    
    const { error } = await query;
    if (error) throw error;
  },

  hasRole: async (userId: string, role: UserRole): Promise<boolean> => {
    const { data, error } = await supabase
      .rpc('has_role', { user_id: userId, check_role: role as any });
    
    if (error) throw error;
    return data || false;
  },

  hasTeamRole: async (userId: string, role: UserRole, teamId: string): Promise<boolean> => {
    const { data, error } = await supabase
      .rpc('has_team_role', { 
        user_id: userId, 
        check_role: role as any, 
        check_team_id: teamId 
      });
    
    if (error) throw error;
    return data || false;
  },
};