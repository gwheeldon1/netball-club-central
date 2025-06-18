
import React, { createContext, useContext, useEffect, useState, useTransition, startTransition } from 'react';
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
  const [isPending, startAsyncTransition] = useTransition();

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          logger.error('Error getting initial session:', error);
        } else {
          startTransition(() => {
            setCurrentUser(session?.user ?? null);
            setLoading(false);
          });
          
          if (session?.user) {
            await loadUserData(session.user);
          }
        }
      } catch (error) {
        logger.error('Error in getInitialSession:', error);
        startTransition(() => {
          setLoading(false);
        });
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        startTransition(() => {
          setCurrentUser(session?.user ?? null);
          setLoading(false);
        });
        
        if (session?.user) {
          // Load user data in background
          setTimeout(() => {
            loadUserData(session.user);
          }, 0);
        } else {
          startTransition(() => {
            setUserRoles([]);
            setUserProfile(null);
          });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const loadUserData = async (user: User) => {
    try {
      // Load from profiles table first
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profileError) {
        logger.error('Error loading profile:', profileError);
      }

      // Find guardian by email to get the guardian ID for role lookup
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
        }
      } catch (error) {
        // Guardians table might not exist, fall back to profile data
        logger.warn('Guardians table not accessible, using profile data:', error);
      }

      // Set user profile from guardian data or profile data or auth data
      startTransition(() => {
        setUserProfile({
          firstName: guardianData?.first_name || profileData?.first_name || user.user_metadata?.first_name || '',
          lastName: guardianData?.last_name || profileData?.last_name || user.user_metadata?.last_name || '',
          email: guardianData?.email || profileData?.email || user.email || '',
          phone: guardianData?.phone || profileData?.phone || user.user_metadata?.phone || '',
          profileImage: guardianData?.profile_image || profileData?.profile_image || user.user_metadata?.profile_image || '',
          guardianId: guardianId,
        });
      });

      // Load user roles using the guardian ID (this is the key fix!)
      if (guardianId) {
        await loadUserRoles(guardianId);
      } else {
        // If no guardian found, default to parent role
        startTransition(() => {
          setUserRoles(['parent']);
        });
      }

    } catch (error) {
      logger.error('Error in loadUserData:', error);
      // Set basic profile from auth user data
      startTransition(() => {
        setUserProfile({
          firstName: user.user_metadata?.first_name || '',
          lastName: user.user_metadata?.last_name || '',
          email: user.email || '',
          phone: user.user_metadata?.phone || '',
          profileImage: user.user_metadata?.profile_image || '',
        });
        setUserRoles(['parent']); // Default role
      });
    }
  };

  const loadUserRoles = async (guardianId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('guardian_id', guardianId)
        .eq('is_active', true);

      if (error) {
        logger.error('Error loading user roles:', error);
        startTransition(() => {
          setUserRoles(['parent']); // Default fallback
        });
        return;
      }

      const roles = data?.map(r => r.role as UserRole) || ['parent'];
      startTransition(() => {
        setUserRoles(roles);
      });
      
      // Debug logging
      console.log('Loaded roles for guardian:', guardianId, 'roles:', roles);
      
    } catch (error) {
      logger.error('Error in loadUserRoles:', error);
      startTransition(() => {
        setUserRoles(['parent']); // Default fallback
      });
    }
  };

  const refreshUserRoles = async () => {
    if (currentUser && userProfile?.guardianId) {
      await loadUserRoles(userProfile.guardianId);
    } else if (currentUser) {
      // Try to find guardian by email again
      await loadUserData(currentUser);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
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
      const { error } = await supabase.auth.signOut();
      if (error) {
        logger.error('Error signing out:', error);
        throw error;
      }
    } catch (error) {
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
    user: currentUser, // Alias for compatibility
    loading: loading || isPending,
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
