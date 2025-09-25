import { apiBaseUrl } from "@/data/data";

/**
 * Logout function that calls the backend logout endpoint
 * and redirects to login page
 */
export const logout = async (): Promise<void> => {
  try {
    const response = await fetch(`${apiBaseUrl}/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Important for cookies
    });

    // Even if the logout request fails, we should still clear local state
    // The backend will handle clearing the cookie if the request succeeds
    
    if (!response.ok) {
      console.warn('Logout request failed, but continuing with local cleanup');
    }

    // Clear any client-side storage if you have any
    // localStorage.removeItem('user');
    // sessionStorage.clear();

    // Redirect to login page
    window.location.href = '/login';
    
  } catch (error) {
    console.error('Error during logout:', error);
    // Still redirect even if there's an error
    window.location.href = '/login';
  }
};

/**
 * Check if user is authenticated by verifying the auth_token cookie
 * This is a client-side check only
 */
export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const cookies = document.cookie.split(';');
  const authToken = cookies.find(cookie => 
    cookie.trim().startsWith('auth_token=')
  );
  
  return !!authToken;
};

/**
 * Get current user information from the backend
 */
export const getCurrentUser = async () => {
  try {
    const response = await fetch(`${apiBaseUrl}/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to get current user');
    }

    const data = await response.json();
    return data.message; // Based on backend response format: { message: userJwtPayload }
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};