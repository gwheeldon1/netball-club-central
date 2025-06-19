
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { supabase } from '@/integrations/supabase/client';
import { UserPermissions, Permission, PermissionCheck, PermissionContext } from '../types/permissions';
import { logger } from '@/utils/logger';

// Custom base query that uses Supabase
const supabaseBaseQuery = fetchBaseQuery({
  baseUrl: '/', // Not used, but required
  prepareHeaders: async (headers) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      headers.set('authorization', `Bearer ${session.access_token}`);
    }
    return headers;
  },
});

export const permissionsApi = createApi({
  reducerPath: 'permissionsApi',
  baseQuery: supabaseBaseQuery,
  tagTypes: ['UserPermissions', 'AccessibleTeams'],
  keepUnusedDataFor: 300, // 5 minutes
  refetchOnReconnect: true,
  refetchOnFocus: true,
  endpoints: (builder) => ({
    getUserPermissions: builder.query<UserPermissions, string>({
      queryFn: async (userId) => {
        try {
          console.log('🔍 RTK Query: Getting permissions for user:', userId);
          
          // Get user permissions
          const { data: permissionsData, error: permError } = await supabase
            .rpc('get_user_permissions', { user_id: userId });

          if (permError) {
            logger.error('Error fetching user permissions:', permError);
            throw permError;
          }

          // Get accessible teams
          const { data: teamsData, error: teamsError } = await supabase
            .rpc('get_accessible_teams', { user_id: userId });

          if (teamsError) {
            logger.error('Error fetching accessible teams:', teamsError);
            throw teamsError;
          }

          // Get user roles
          const { data: rolesData, error: rolesError } = await supabase
            .from('user_roles')
            .select('role')
            .eq('guardian_id', userId)
            .eq('is_active', true);

          if (rolesError) {
            logger.error('Error fetching user roles:', rolesError);
          }

          const permissions = permissionsData?.map(p => p.permission_name as Permission) || [];
          const accessibleTeams = teamsData?.map(t => t.team_id) || [];
          const roles = rolesData?.map(r => r.role) || [];

          const userPermissions: UserPermissions = {
            permissions,
            accessibleTeams,
            roles,
            lastUpdated: Date.now(),
            expiresAt: Date.now() + (5 * 60 * 1000), // 5 minutes
          };

          console.log('✅ RTK Query: Permissions loaded:', userPermissions);
          return { data: userPermissions };
        } catch (error) {
          logger.error('RTK Query: Error in getUserPermissions:', error);
          return { error: { status: 'FETCH_ERROR', error: String(error) } };
        }
      },
      providesTags: ['UserPermissions'],
    }),

    checkPermission: builder.query<PermissionCheck, { userId: string; permission: Permission; context?: PermissionContext }>({
      queryFn: async ({ userId, permission, context }) => {
        try {
          const { data, error } = await supabase
            .rpc('has_permission', { 
              user_id: userId, 
              permission_name: permission 
            });

          if (error) {
            throw error;
          }

          const check: PermissionCheck = {
            permission,
            context,
            result: data || false,
            timestamp: Date.now(),
          };

          // Log the permission check for audit purposes
          console.log('🔐 Permission check:', check);

          return { data: check };
        } catch (error) {
          return { 
            error: { status: 'FETCH_ERROR', error: String(error) },
          };
        }
      },
    }),

    getAccessibleTeams: builder.query<string[], string>({
      queryFn: async (userId) => {
        try {
          const { data, error } = await supabase
            .rpc('get_accessible_teams', { user_id: userId });

          if (error) {
            throw error;
          }

          return { data: data?.map(t => t.team_id) || [] };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: String(error) } };
        }
      },
      providesTags: ['AccessibleTeams'],
    }),

    invalidatePermissions: builder.mutation<void, string>({
      queryFn: async () => ({ data: undefined }),
      invalidatesTags: ['UserPermissions', 'AccessibleTeams'],
    }),
  }),
});

export const {
  useGetUserPermissionsQuery,
  useCheckPermissionQuery,
  useGetAccessibleTeamsQuery,
  useInvalidatePermissionsMutation,
} = permissionsApi;
