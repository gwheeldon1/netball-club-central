
import { createContext, useContext, useState, ReactNode } from 'react';
import { User, UserRole } from '../types';
import { userApi } from '../services/api';

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasRole: (role: UserRole) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const login = async (email: string, password: string): Promise<boolean> => {
    // In a real app, this would be an API call to authenticate
    // For demo purposes, we're using localStorage API service
    const user = userApi.getByEmail(email.toLowerCase());
    
    if (user) {
      // In a real app, we'd check the password hash
      setCurrentUser(user);
      return true;
    }
    
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const hasRole = (role: UserRole): boolean => {
    if (!currentUser) return false;
    return currentUser.roles.includes(role);
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, hasRole }}>
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
