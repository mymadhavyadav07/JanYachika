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

  const res = await fetch(`${process.env.API_BASE_URL}/me`, {
    headers: {
      Cookie: `auth_token=${token}`,
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    redirect('/login');
  }

  const user: User = await res.json();

  return (
    <UserContext.Provider value={user}>
      {children}
    </UserContext.Provider>
  );
}
