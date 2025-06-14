
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";
import { logger } from '@/utils/logger';

// For backward compatibility with existing code
export type UserRole = 'admin' | 'coach' | 'manager' | 'parent';

interface AuthContextType {
  user: SupabaseUser | null;
  session: Session | null;
  currentUser: SupabaseUser | null; // For backward compatibility
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  hasRole: (role: UserRole) => boolean;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        if (event === 'SIGNED_IN') {
          logger.info('User signed in', { userId: session?.user?.id });
        } else if (event === 'SIGNED_OUT') {
          logger.info('User signed out');
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password,
      });

      if (error) {
        logger.error('Login error:', error);
        toast.error(error.message || 'Login failed');
        return false;
      }

      if (data.user) {
        toast.success('Logged in successfully');
        return true;
      }

      return false;
    } catch (error) {
      logger.error('Unexpected login error:', error);
      toast.error('An unexpected error occurred');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        logger.error('Logout error:', error);
        toast.error('Failed to logout');
      } else {
        toast.success('Logged out successfully');
      }
    } catch (error) {
      logger.error('Unexpected logout error:', error);
      toast.error('An unexpected error occurred');
    }
  };

  const hasRole = (role: UserRole): boolean => {
    if (!user) return false;
    
    // Temporary admin check - replace with proper role system
    if (role === 'admin') {
      return user.email === 'admin@netballclub.com' || user.email === 'admin@example.com';
    }
    
    // Default to parent role for now - this will be replaced with proper role queries
    if (role === 'parent') {
      return true; // All logged-in users can be considered parents for now
    }
    
    return false;
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ 
      user,
      session,
      currentUser: user, // For backward compatibility
      login, 
      logout, 
      hasRole, 
      isAuthenticated,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};
