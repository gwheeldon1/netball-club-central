// Authentication service layer - centralized auth operations
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { logger } from '@/utils/logger';
import { sanitizeInput } from '@/utils/validation';

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface SignUpData extends AuthCredentials {
  firstName?: string;
  lastName?: string;
  confirmPassword?: string;
}

export interface AuthResponse {
  user: User | null;
  session: Session | null;
  error: string | null;
}

class AuthService {
  private static instance: AuthService;

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // Sign in with email and password
  async signIn(credentials: AuthCredentials): Promise<AuthResponse> {
    try {
      const sanitizedEmail = sanitizeInput(credentials.email.toLowerCase().trim());
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: sanitizedEmail,
        password: credentials.password,
      });

      if (error) {
        logger.error('Sign in error:', error);
        return {
          user: null,
          session: null,
          error: this.mapAuthError(error.message),
        };
      }

      logger.info('User signed in successfully', { userId: data.user?.id });
      
      return {
        user: data.user,
        session: data.session,
        error: null,
      };
    } catch (error) {
      logger.error('Unexpected sign in error:', error);
      return {
        user: null,
        session: null,
        error: 'An unexpected error occurred during sign in',
      };
    }
  }

  // Sign up with email and password
  async signUp(signUpData: SignUpData): Promise<AuthResponse> {
    try {
      const sanitizedEmail = sanitizeInput(signUpData.email.toLowerCase().trim());
      
      const { data, error } = await supabase.auth.signUp({
        email: sanitizedEmail,
        password: signUpData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            first_name: signUpData.firstName ? sanitizeInput(signUpData.firstName) : undefined,
            last_name: signUpData.lastName ? sanitizeInput(signUpData.lastName) : undefined,
          },
        },
      });

      if (error) {
        logger.error('Sign up error:', error);
        return {
          user: null,
          session: null,
          error: this.mapAuthError(error.message),
        };
      }

      logger.info('User signed up successfully', { userId: data.user?.id });

      return {
        user: data.user,
        session: data.session,
        error: null,
      };
    } catch (error) {
      logger.error('Unexpected sign up error:', error);
      return {
        user: null,
        session: null,
        error: 'An unexpected error occurred during sign up',
      };
    }
  }

  // Sign out
  async signOut(): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        logger.error('Sign out error:', error);
        return { error: 'Failed to sign out' };
      }

      logger.info('User signed out successfully');
      return { error: null };
    } catch (error) {
      logger.error('Unexpected sign out error:', error);
      return { error: 'An unexpected error occurred during sign out' };
    }
  }

  // Reset password
  async resetPassword(email: string): Promise<{ error: string | null }> {
    try {
      const sanitizedEmail = sanitizeInput(email.toLowerCase().trim());
      
      const { error } = await supabase.auth.resetPasswordForEmail(sanitizedEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        logger.error('Password reset error:', error);
        return { error: this.mapAuthError(error.message) };
      }

      logger.info('Password reset email sent', { email: sanitizedEmail });
      return { error: null };
    } catch (error) {
      logger.error('Unexpected password reset error:', error);
      return { error: 'An unexpected error occurred' };
    }
  }

  // Update password
  async updatePassword(newPassword: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        logger.error('Password update error:', error);
        return { error: this.mapAuthError(error.message) };
      }

      logger.info('Password updated successfully');
      return { error: null };
    } catch (error) {
      logger.error('Unexpected password update error:', error);
      return { error: 'An unexpected error occurred' };
    }
  }

  // Get current session
  async getSession(): Promise<{ session: Session | null; error: string | null }> {
    try {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        logger.error('Get session error:', error);
        return { session: null, error: 'Failed to get session' };
      }

      return { session: data.session, error: null };
    } catch (error) {
      logger.error('Unexpected get session error:', error);
      return { session: null, error: 'An unexpected error occurred' };
    }
  }

  // Get current user
  async getUser(): Promise<{ user: User | null; error: string | null }> {
    try {
      const { data, error } = await supabase.auth.getUser();
      
      if (error) {
        logger.error('Get user error:', error);
        return { user: null, error: 'Failed to get user' };
      }

      return { user: data.user, error: null };
    } catch (error) {
      logger.error('Unexpected get user error:', error);
      return { user: null, error: 'An unexpected error occurred' };
    }
  }

  // Subscribe to auth state changes
  onAuthStateChange(callback: (session: Session | null) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      logger.info('Auth state changed', { event, userId: session?.user?.id });
      callback(session);
    });
  }

  // Map Supabase auth errors to user-friendly messages
  private mapAuthError(errorMessage: string): string {
    const errorMap: Record<string, string> = {
      'Invalid login credentials': 'Invalid email or password. Please check your credentials and try again.',
      'Email not confirmed': 'Please check your email and click the confirmation link before signing in.',
      'User already registered': 'An account with this email already exists. Please sign in instead.',
      'Password should be at least 6 characters': 'Password must be at least 6 characters long.',
      'Signup is disabled': 'New registrations are currently disabled. Please contact support.',
      'Email rate limit exceeded': 'Too many requests. Please wait a moment before trying again.',
      'Invalid email': 'Please enter a valid email address.',
    };

    // Check for partial matches
    for (const [key, value] of Object.entries(errorMap)) {
      if (errorMessage.toLowerCase().includes(key.toLowerCase())) {
        return value;
      }
    }

    // Return generic message for unknown errors
    return 'An error occurred. Please try again or contact support if the problem persists.';
  }
}

export const authService = AuthService.getInstance();