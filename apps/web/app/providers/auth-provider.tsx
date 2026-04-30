'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import * as authService from '@/services/auth.service';
import type { AuthUser } from '@/services/auth.service';

type AuthContextValue = {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthLoading: boolean;
  setAuth: (user: AuthUser, accessToken: string) => void;
  clearAuth: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  function setAuth(user: AuthUser, accessToken: string) {
    setUser(user);
    setAccessToken(accessToken);
    localStorage.setItem('accessToken', accessToken);
  }

  function clearAuth() {
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem('accessToken');
  }

  useEffect(() => {
    async function restoreSession() {
      try {
        const storedAccessToken = localStorage.getItem('accessToken');

        if (storedAccessToken) {
          setAccessToken(storedAccessToken);
        }

        try {
          const user = await authService.me();
          setUser(user);
          return;
        } catch {
          const refreshed = await authService.refresh();
          setAuth(refreshed.user, refreshed.accessToken);
        }
      } catch {
        clearAuth();
      } finally {
        setIsAuthLoading(false);
      }
    }

    restoreSession();
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, accessToken, isAuthLoading, setAuth, clearAuth }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}