import React, { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from 'react';
import type { User, LoginRequest } from '../types';
import { UserRole, getUserRole } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * Initialize authentication on mount
   * Check if we have valid tokens and fetch user profile
   */
  useEffect(() => {
    const initAuth = async () => {
      const accessToken = authService.getAccessToken();
      const storedUser = authService.getStoredUser();

      if (accessToken && storedUser) {
        try {
          // Verify token is still valid by fetching current user
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
        } catch (error) {
          // Token invalid or expired, clear auth data
          console.error('Auth initialization failed:', error);
          authService.clearAuth();
          setUser(null);
        }
      } else {
        // No valid auth data
        authService.clearAuth();
      }

      setLoading(false);
    };

    initAuth();
  }, []);

  /**
   * Login user
   * Returns the logged-in user object
   */
  const login = async (credentials: LoginRequest): Promise<User> => {
    try {
      // authService.login now:
      // 1. Posts credentials to /users/login
      // 2. Receives access_token and refresh_token
      // 3. Fetches user profile from /users/me
      // 4. Returns user object
      const user = await authService.login(credentials);
      setUser(user);
      return user;
    } catch (error) {
      // Clear any partial auth data on login failure
      authService.clearAuth();
      setUser(null);
      throw error;
    }
  };

  /**
   * Logout user and clear all auth data
   */
  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
    }
  };

  /**
   * Refresh user profile from backend
   */
  const refreshUser = useCallback(async (): Promise<void> => {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Failed to refresh user:', error);
      // Don't clear auth on refresh failure, token might still be valid
    }
  }, []);

  /**
   * Check if user has specific role
   */
  const hasRole = useCallback((role: UserRole): boolean => {
    if (!user) return false;
    const userRole = getUserRole(user);
    return userRole === role;
  }, [user]);

  /**
   * Check if user has any of the specified roles
   */
  const hasAnyRole = useCallback((roles: UserRole[]): boolean => {
    if (!user) return false;
    const userRole = getUserRole(user);
    return roles.includes(userRole);
  }, [user]);

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
    refreshUser,
    hasRole,
    hasAnyRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
