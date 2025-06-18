
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';
import { UserRole } from '@/types/unified';

interface UserProfile {
  firstName?: string;
  lastName?: string;
  email?: string;
  guardianId?: string;
  profileImage?: string;
  phone?: string;
}

interface AuthContextType {
  currentUser: User | null;
  user: User | null;
  loading: boolean;
  userRoles: UserRole[];
  userProfile: UserProfile | null;
  hasRole: (role: UserRole) => boolean;
  signOut: () => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUserRoles: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    let mounted = true;

    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          logger.error('Error getting initial session:', error);
        } else if (mounted) {
          setCurrentUser(session?.user ?? null);
          
          if (session?.user) {
            await loadUserData(session.user);
          }
        }
      } catch (error) {
        logger.error('Error in getInitialSession:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('Auth state change:', { event, user: session?.user?.email });
        
        setCurrentUser(session?.user ?? null);
        
        if (session?.user) {
          await loadUserData(session.user);
        } else {
          setUserRoles([]);
          setUserProfile(null);
        }
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const loadUserData = async (user: User) => {
    try {
      console.log('=== loadUserData DEBUG ===');
      console.log('User ID:', user.id);
      console.log('User Email:', user.email);

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profileError) {
        logger.error('Error loading profile:', profileError);
      }

      console.log('Profile data:', profileData);

      let guardianId: string | undefined;
      let guardianData = null;
      
      try {
        console.log('Looking for guardian with email:', user.email);
        const { data: guardianResponse, error: guardianError } = await supabase
          .from('guardians')
          .select('id, first_name, last_name, email, phone, profile_image')
          .eq('email', user.email)
          .maybeSingle();

        console.log('Guardian query result:', { data: guardianResponse, error: guardianError });

        if (!guardianError && guardianResponse) {
          guardianId = guardianResponse.id;
          guardianData = guardianResponse;
          console.log('Found guardian ID:', guardianId);
        } else {
          console.log('Guardian not found or error:', guardianError);
        }
      } catch (error) {
        logger.warn('Guardians table not accessible, using profile data:', error);
        console.log('Guardian table error:', error);
      }

      setUserProfile({
        firstName: guardianData?.first_name || profileData?.first_name || user.user_metadata?.first_name || '',
        lastName: guardianData?.last_name || profileData?.last_name || user.user_metadata?.last_name || '',
        email: guardianData?.email || profileData?.email || user.email || '',
        phone: guardianData?.phone || profileData?.phone || user.user_metadata?.phone || '',
        profileImage: guardianData?.profile_image || profileData?.profile_image || user.user_metadata?.profile_image || '',
        guardianId: guardianId,
      });

      if (guardianId) {
        console.log('Loading roles for guardian ID:', guardianId);
        await loadUserRoles(guardianId);
      } else {
        console.log('No guardian ID found, defaulting to parent role');
        setUserRoles(['parent']);
      }

    } catch (error) {
      logger.error('Error in loadUserData:', error);
      console.log('loadUserData error:', error);
      setUserProfile({
        firstName: user.user_metadata?.first_name || '',
        lastName: user.user_metadata?.last_name || '',
        email: user.email || '',
        phone: user.user_metadata?.phone || '',
        profileImage: user.user_metadata?.profile_image || '',
      });
      setUserRoles(['parent']);
    }
  };

  const loadUserRoles = async (guardianId: string) => {
    try {
      console.log('=== loadUserRoles DEBUG ===');
      console.log('Looking for roles for guardian ID:', guardianId);

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('guardian_id', guardianId)
        .eq('is_active', true);

      console.log('User roles query result:', { data, error });

      if (error) {
        logger.error('Error loading user roles:', error);
        console.log('User roles error:', error);
        setUserRoles(['parent']);
        return;
      }

      const roles = data?.map(r => r.role as UserRole) || ['parent'];
      console.log('Mapped roles:', roles);
      
      setUserRoles(roles);
      
      console.log('Final roles set for guardian:', guardianId, 'roles:', roles);
      
    } catch (error) {
      logger.error('Error in loadUserRoles:', error);
      console.log('loadUserRoles catch error:', error);
      setUserRoles(['parent']);
    }
  };

  const refreshUserRoles = async () => {
    if (currentUser && userProfile?.guardianId) {
      await loadUserRoles(userProfile.guardianId);
    } else if (currentUser) {
      await loadUserData(currentUser);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        logger.error('Login error:', error);
        return false;
      }

      return true;
    } catch (error) {
      logger.error('Login error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      console.log('Logout called');
      const { error } = await supabase.auth.signOut();
      if (error) {
        logger.error('Error signing out:', error);
        console.error('Logout error:', error);
        throw error;
      }
      console.log('Logout successful');
      
      setCurrentUser(null);
      setUserRoles([]);
      setUserProfile(null);
      
    } catch (error) {
      logger.error('Error in logout:', error);
      console.error('Logout catch error:', error);
      throw error;
    }
  };

  const hasRole = (role: UserRole): boolean => {
    return userRoles.includes(role);
  };

  const signOut = async () => {
    await logout();
  };

  const value = {
    currentUser,
    user: currentUser,
    loading,
    userRoles,
    userProfile,
    hasRole,
    signOut,
    login,
    logout,
    refreshUserRoles,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
