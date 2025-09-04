// app/context/UserContext.tsx
'use client';

import { createContext, useContext } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
}

export const UserContext = createContext<User | null>(null);

export const useUser = () => useContext(UserContext);
