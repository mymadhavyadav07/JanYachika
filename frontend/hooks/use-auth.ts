import { useState, useEffect } from 'react';
import { getCurrentUser, isAuthenticated, logout } from '@/lib/auth';

export interface User {
  sub: string;
  role: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  const checkAuthStatus = async () => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const hasAuthCookie = isAuthenticated();
      
      if (!hasAuthCookie) {
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        });
        return;
      }

      const user = await getCurrentUser();
      
      if (user) {
        setAuthState({
          user,
          isLoading: false,
          isAuthenticated: true,
        });
      } else {
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  };

  const handleLogout = async () => {
    try {
      await logout();

      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
    } catch (error) {
      console.error('Logout error:', error);

      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
      window.location.href = '/login';
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  return {
    ...authState,
    logout: handleLogout,
    refreshAuth: checkAuthStatus,
  };
};