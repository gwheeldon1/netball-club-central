
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";
import { logger } from '@/utils/logger';
import { UserRole, UserProfile } from '@/types/unified';
import { rolesApi } from '@/services/api/roles';

interface AuthContextType {
  user: SupabaseUser | null;
  session: Session | null;
  currentUser: SupabaseUser | null; // For backward compatibility
  userProfile: UserProfile | null;
  userRoles: UserRole[];
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  refreshUserRoles: () => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch user profile data
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (error) {
        logger.error('Error fetching user profile:', error);
        return;
      }
      
      if (data) {
        const profile: UserProfile = {
          id: data.id,
          userId: data.user_id,
          firstName: data.first_name,
          lastName: data.last_name,
          email: data.email,
          phone: data.phone,
          profileImage: data.profile_image,
          createdAt: data.created_at,
          updatedAt: data.updated_at
        };
        setUserProfile(profile);
      }
    } catch (error) {
      logger.error('Unexpected error fetching profile:', error);
    }
  };

  // Fetch user roles
  const fetchUserRoles = async (userId: string) => {
    try {
      const roles = await rolesApi.getUserRoles(userId);
      setUserRoles(roles);
    } catch (error) {
      logger.error('Error fetching user roles:', error);
      setUserRoles([]);
    }
  };

  // Refresh user roles (for use after role changes)
  const refreshUserRoles = async () => {
    if (user?.id) {
      await fetchUserRoles(user.id);
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch profile data and roles asynchronously
          setTimeout(() => {
            fetchUserProfile(session.user.id);
            fetchUserRoles(session.user.id);
          }, 0);
        } else {
          setUserProfile(null);
          setUserRoles([]);
        }
        
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
    return userRoles.includes(role);
  };

  const hasAnyRole = (roles: UserRole[]): boolean => {
    return roles.some(role => userRoles.includes(role));
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ 
      user,
      session,
      currentUser: user, // For backward compatibility
      userProfile,
      userRoles,
      login, 
      logout, 
      hasRole,
      hasAnyRole,
      refreshUserRoles,
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
