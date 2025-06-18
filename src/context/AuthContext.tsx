
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
        console.log('AuthProvider: Getting initial session');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('AuthProvider: Error getting initial session:', error);
          logger.error('Error getting initial session:', error);
        } else if (mounted) {
          console.log('AuthProvider: Initial session found:', session?.user?.email);
          setCurrentUser(session?.user ?? null);
          
          if (session?.user) {
            await loadUserData(session.user);
          }
        }
      } catch (error) {
        console.error('AuthProvider: Error in getInitialSession:', error);
        logger.error('Error in getInitialSession:', error);
      } finally {
        if (mounted) {
          console.log('AuthProvider: Initial loading complete, setting loading to false');
          setLoading(false);
        }
      }
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('AuthProvider: Auth state change:', { event, user: session?.user?.email });
        
        setCurrentUser(session?.user ?? null);
        
        if (session?.user) {
          await loadUserData(session.user);
        } else {
          console.log('AuthProvider: Clearing user data');
          setUserRoles([]);
          setUserProfile(null);
        }
        
        if (mounted) {
          console.log('AuthProvider: Auth state change complete, setting loading to false');
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const loadUserData = async (user: User) => {
    try {
      console.log('AuthProvider: Loading user data for:', user.email);

      // Load profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profileError) {
        console.warn('AuthProvider: Error loading profile:', profileError);
        logger.error('Error loading profile:', profileError);
      }

      // Load guardian data
      let guardianId: string | undefined;
      let guardianData = null;
      
      try {
        const { data: guardianResponse, error: guardianError } = await supabase
          .from('guardians')
          .select('id, first_name, last_name, email, phone, profile_image')
          .eq('email', user.email)
          .maybeSingle();

        if (!guardianError && guardianResponse) {
          guardianId = guardianResponse.id;
          guardianData = guardianResponse;
          console.log('AuthProvider: Found guardian ID:', guardianId);
        }
      } catch (error) {
        console.warn('AuthProvider: Guardian table not accessible:', error);
        logger.warn('Guardians table not accessible:', error);
      }

      // Set user profile
      const profile: UserProfile = {
        firstName: guardianData?.first_name || profileData?.first_name || user.user_metadata?.first_name || '',
        lastName: guardianData?.last_name || profileData?.last_name || user.user_metadata?.last_name || '',
        email: guardianData?.email || profileData?.email || user.email || '',
        phone: guardianData?.phone || profileData?.phone || user.user_metadata?.phone || '',
        profileImage: guardianData?.profile_image || profileData?.profile_image || user.user_metadata?.profile_image || '',
        guardianId: guardianId,
      };

      setUserProfile(profile);

      // Load user roles
      if (guardianId) {
        await loadUserRoles(guardianId);
      } else {
        console.log('AuthProvider: No guardian ID found, defaulting to parent role');
        setUserRoles(['parent']);
      }

      console.log('AuthProvider: User data loading complete');

    } catch (error) {
      console.error('AuthProvider: Error in loadUserData:', error);
      logger.error('Error in loadUserData:', error);
      
      // Fallback profile
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
      console.log('AuthProvider: Loading roles for guardian ID:', guardianId);

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('guardian_id', guardianId)
        .eq('is_active', true);

      if (error) {
        console.error('AuthProvider: Error loading user roles:', error);
        logger.error('Error loading user roles:', error);
        setUserRoles(['parent']);
        return;
      }

      const roles = data?.map(r => r.role as UserRole) || ['parent'];
      console.log('AuthProvider: Loaded roles:', roles);
      setUserRoles(roles);
      
    } catch (error) {
      console.error('AuthProvider: Error in loadUserRoles:', error);
      logger.error('Error in loadUserRoles:', error);
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
      console.log('AuthProvider: Login attempt for:', email);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('AuthProvider: Login error:', error);
        logger.error('Login error:', error);
        return false;
      }

      console.log('AuthProvider: Login successful');
      return true;
    } catch (error) {
      console.error('AuthProvider: Login error:', error);
      logger.error('Login error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      console.log('AuthProvider: Logout initiated');
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('AuthProvider: Logout error:', error);
        logger.error('Error signing out:', error);
        throw error;
      }
      
      console.log('AuthProvider: Logout successful');
      setCurrentUser(null);
      setUserRoles([]);
      setUserProfile(null);
      
    } catch (error) {
      console.error('AuthProvider: Error in logout:', error);
      logger.error('Error in logout:', error);
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

  console.log('AuthProvider: Providing context with loading:', loading, 'user:', currentUser?.email);

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
