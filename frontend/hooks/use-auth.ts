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

/**
 * Authentication hook that safely checks auth status without causing redirects
 * @param options.requireAuth - If true, will redirect to login on auth failure
 */
export const useAuth = (options?: { requireAuth?: boolean }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  const checkAuthStatus = async () => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
      // First check if auth cookie exists (client-side check)
      const hasAuthCookie = isAuthenticated();
      
      if (!hasAuthCookie) {
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        });
        return;
      }

      // If cookie exists, verify with backend
      const user = await getCurrentUser();
      
      if (user && user.sub) {
        setAuthState({
          user,
          isLoading: false,
          isAuthenticated: true,
        });
      } else {
        // Invalid token or failed verification
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        });
        
        // Only redirect if explicitly required
        if (options?.requireAuth) {
          window.location.href = '/login';
        }
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      
      // Always set as not authenticated on error
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
      
      // Only redirect if explicitly required
      if (options?.requireAuth) {
        window.location.href = '/login';
      }
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      // logout function handles redirect to login page
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback redirect if logout function fails
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
