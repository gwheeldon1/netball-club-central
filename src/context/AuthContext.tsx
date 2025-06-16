
import React, { createContext, useContext, useEffect, useState, useTransition, startTransition } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';
import { UserRole } from '@/types/unified';

interface AuthContextType {
  currentUser: User | null;
  user: User | null;
  loading: boolean;
  userRoles: UserRole[];
  hasRole: (role: UserRole) => boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
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
          // Load user roles in background
          loadUserRoles(session.user.id);
        } else {
          startTransition(() => {
            setUserRoles([]);
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

  const hasRole = (role: UserRole): boolean => {
    return userRoles.includes(role);
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        logger.error('Error signing out:', error);
        throw error;
      }
    } catch (error) {
      logger.error('Error in signOut:', error);
      throw error;
    }
  };

  const value = {
    currentUser,
    user: currentUser, // Alias for compatibility
    loading: loading || isPending,
    userRoles,
    hasRole,
    signOut,
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
