import { apiBaseUrl } from "@/data/data";

export interface User {
  username: string;
  email: string;
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const response = await fetch(`${apiBaseUrl}/me`, {
      method: 'GET',
      credentials: 'include', // This ensures cookies are sent
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      
      return null;
    }

    const user: User = await response.json();
    return user;
  } catch (error) {
    console.log('Error fetching current user:', error);
    return null;
  }
}
