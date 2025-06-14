
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, UserRole } from '../types';
import { api } from '@/services/offlineApi';
import { toast } from "sonner";

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasRole: (role: UserRole) => boolean;
  isAuthenticated: boolean;
}

const AUTH_STORAGE_KEY = 'netball_auth_user';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  // Offline functionality removed for simplicity

  // Load previously authenticated user from localStorage on init
  useEffect(() => {
    const storedUser = localStorage.getItem(AUTH_STORAGE_KEY);
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setCurrentUser(user);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing stored user data', error);
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // In a real app, this would be an API call to authenticate
    // For our offline-first approach, we use localStorage API service
    try {
      const user = await api.getUserByEmail(email.toLowerCase());
      
      if (user) {
        // In a real app, we'd check the password hash
        setCurrentUser(user);
        setIsAuthenticated(true);
        
        // Store the authenticated user in localStorage
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
        return true;
      }
    } catch (error) {
      console.error('Error during login:', error);
      toast.error("Login failed");
    }
    
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const hasRole = (role: UserRole): boolean => {
    if (!currentUser) return false;
    return currentUser.roles.includes(role);
  };

  return (
    <AuthContext.Provider value={{ 
      currentUser, 
      login, 
      logout, 
      hasRole, 
      isAuthenticated
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
