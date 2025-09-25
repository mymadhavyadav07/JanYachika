import { ReactNode } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { UserContext, User } from '@/context/UserContext';

interface AuthGuardProps {
  children: ReactNode;
}

export default async function AuthGuard({ children }: AuthGuardProps) {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) {
    redirect('/login');
  }

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/me`, {
      headers: {
        Cookie: `auth_token=${token}`,
      },
      cache: 'no-store',
    });
    
    if (!res.ok) {
      console.log('AuthGuard: Authentication failed, redirecting to login');
      redirect('/login');
    }
    
    const response = await res.json();
    const user: User = response.message; // Extract the actual user data from the message field
    
    return (
      <UserContext.Provider value={user}>
        {children}
      </UserContext.Provider>
    );
  } catch (error) {
    console.error('AuthGuard: Error verifying token:', error);
    redirect('/login');
  }
}

