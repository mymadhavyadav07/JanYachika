// app/context/UserContext.tsx
'use client';

import { createContext, useContext } from 'react';

export interface User {
  sub: string;  // email from JWT payload
  role: string;
}

export const UserContext = createContext<User | null>(null);

export const useUser = () => useContext(UserContext);
