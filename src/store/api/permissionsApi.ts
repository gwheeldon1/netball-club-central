
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { supabase } from '@/integrations/supabase/client';

// Simple type definitions
export interface UserPermissions {
  permissions: string[];
  accessibleTeams: string[];
  roles: string[];
  lastUpdated: number;
  expiresAt: number;
}

export interface PermissionCheck {
  permission: string;
  result: boolean;
  timestamp: number;
}

// Simple base query
const baseQuery = fetchBaseQuery({
  baseUrl: '/',
  prepareHeaders: async (headers) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        headers.set('authorization', `Bearer ${session.access_token}`);
      }
    } catch (error) {
      console.error('Error getting session:', error);
    }
    return headers;
  },
});

// Simplified API definition
export const permissionsApi = createApi({
  reducerPath: 'permissionsApi',
  baseQuery,
  tagTypes: ['UserPermissions'],
  endpoints: (builder) => ({
    getUserPermissions: builder.query<UserPermissions, string>({
      queryFn: async (userId: string) => {
        try {
          const { data: permissionsData, error: permError } = await supabase
            .rpc('get_user_permissions', { user_id: userId });

          if (permError) {
            throw permError;
          }

          const { data: teamsData, error: teamsError } = await supabase
            .rpc('get_accessible_teams', { user_id: userId });

          if (teamsError) {
            throw teamsError;
          }

          const { data: rolesData, error: rolesError } = await supabase
            .from('user_roles')
            .select('role')
            .eq('guardian_id', userId)
            .eq('is_active', true);

          if (rolesError) {
            console.error('Error fetching roles:', rolesError);
          }

          const result: UserPermissions = {
            permissions: permissionsData?.map((p: any) => p.permission_name) || [],
            accessibleTeams: teamsData?.map((t: any) => t.team_id) || [],
            roles: rolesData?.map((r: any) => r.role) || [],
            lastUpdated: Date.now(),
            expiresAt: Date.now() + (5 * 60 * 1000),
          };

          return { data: result };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: String(error) } };
        }
      },
      providesTags: ['UserPermissions'],
    }),
  }),
});

export const { useGetUserPermissionsQuery } = permissionsApi;
