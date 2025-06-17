
import React, { createContext, useContext, useEffect, useState, useTransition, startTransition } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';
import { UserRole } from '@/types/unified';

interface UserProfile {
  firstName?: string;
  lastName?: string;
  email?: string;
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
  const [isPending] = useTransition();

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
      async (_event, session) => {
        startTransition(() => {
          setCurrentUser(session?.user ?? null);
          setLoading(false);
        });
        
        if (session?.user) {
          // Load user roles and profile in background
          loadUserRoles(session.user.id);
          loadUserProfile(session.user);
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

  const loadUserRoles = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('guardian_id', userId)
        .eq('is_active', true);

      if (error) {
        logger.error('Error loading user roles:', error);
        return;
      }

      startTransition(() => {
        setUserRoles(data?.map(r => r.role as UserRole) || ['parent']);
      });
    } catch (error) {
      logger.error('Error in loadUserRoles:', error);
      startTransition(() => {
        setUserRoles(['parent']);
      });
    }
  };

  const loadUserProfile = async (user: User) => {
    try {
      const { data, error } = await supabase
        .from('guardians')
        .select('first_name, last_name, email')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        logger.error('Error loading user profile:', error);
        return;
      }

      startTransition(() => {
        setUserProfile({
          firstName: data?.first_name || '',
          lastName: data?.last_name || '',
          email: data?.email || user.email || '',
        });
      });
    } catch (error) {
      logger.error('Error in loadUserProfile:', error);
      startTransition(() => {
        setUserProfile({
          firstName: '',
          lastName: '',
          email: user.email || '',
        });
      });
    }
  };

  const refreshUserRoles = async () => {
    if (currentUser) {
      await loadUserRoles(currentUser.id);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data: _data, error } = await supabase.auth.signInWithPassword({
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
