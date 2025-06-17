// User API operations
import { supabase } from '@/integrations/supabase/client';
import { offlineApi } from '../database';

// Define the shape of objects within the user_roles array
interface UserRoleObject {
  role: UserRole;
  is_active: boolean;
  // Potentially other fields like team_id, club_id if they are ever selected and used
}

import { logger } from '@/utils/logger';
import { BaseAPI } from './base';
import { User, UserRole } from '@/types/unified';

class UserAPI extends BaseAPI {
  async getUsers(): Promise<User[]> {
    return this.withOfflineFallback(
      async () => {
        const { data, error } = await supabase
          .from('guardians')
          .select(`
            *,
            user_roles (
              role,
              is_active
            )
          `);
        
        if (error) throw error;
        
        return data?.map(guardian => ({
          id: guardian.id,
          name: `${guardian.first_name} ${guardian.last_name}`,
          email: guardian.email || '',
          phone: guardian.phone || undefined,
          profileImage: guardian.profile_image || undefined,
          roles: guardian.user_roles?.filter((ur: UserRoleObject) => ur.is_active).map((ur: UserRoleObject) => ur.role as UserRole) || ['parent' as UserRole]
        })) || [];
      },
      async () => {
        const dbUsers = await offlineApi.getUsers();
        return dbUsers.map(dbUser => ({
          ...dbUser,
          roles: dbUser.roles as UserRole[]
        }));
      },
      'getUsers'
    );
  }

  async getUserById(id: string): Promise<User | undefined> {
    return this.withOfflineFallback(
      async () => {
        const { data, error } = await supabase
          .from('guardians')
          .select(`
            *,
            user_roles (
              role,
              is_active
            )
          `)
          .eq('id', id)
          .maybeSingle();
        
        if (error || !data) return undefined;
        
        return {
          id: data.id,
          name: `${data.first_name} ${data.last_name}`,
          email: data.email || '',
          phone: data.phone || undefined,
          profileImage: data.profile_image || undefined,
          roles: data.user_roles?.filter((ur: UserRoleObject) => ur.is_active).map((ur: UserRoleObject) => ur.role as UserRole) || ['parent' as UserRole]
        };
      },
      async () => {
        const dbUser = await offlineApi.getUserById(id);
        if (!dbUser) return undefined;
        return {
          ...dbUser,
          roles: dbUser.roles as UserRole[]
        };
      },
      'getUserById'
    );
  }

  async createUser(user: Omit<User, 'id'>): Promise<User> {
    const [firstName, ...lastNameParts] = user.name.split(' ');
    
    if (this.isOnline) {
      try {
        const { data, error } = await supabase
          .from('guardians')
          .insert({
            first_name: firstName,
            last_name: lastNameParts.join(' '),
            email: user.email,
            phone: user.phone,
            approval_status: 'pending'
          })
          .select()
          .single();
        
        if (error) throw error;
        
        // Assign default role
        await supabase
          .from('user_roles')
          .insert({
            guardian_id: data.id,
            role: 'parent'
          });
        
        return {
          id: data.id,
          name: `${data.first_name} ${data.last_name}`,
          email: data.email || '',
          phone: data.phone || undefined,
          profileImage: data.profile_image || undefined,
          roles: ['parent']
        };
      } catch (error) {
        logger.warn('Create user failed online, saving offline:', error);
      }
    }
    
    // Fallback to offline storage
    const dbUser = await offlineApi.createUser(user);
    return {
      ...dbUser,
      roles: dbUser.roles as UserRole[]
    };
  }
}

export const userApi = new UserAPI();