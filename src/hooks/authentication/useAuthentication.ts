'use client';

import { useState } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';

interface AuthenticationHook {
  isAuthenticated: boolean;
  error: Error | null;
  loading: boolean;
  login: (username: string, password: string, callbackUrl?: string) => Promise<void>;
  logout: () => Promise<void>;
}

/**
 * Hook for authentication functionality
 * @returns Authentication state and functions
 */
export const useAuthentication = (): AuthenticationHook => {
  const session = useSession({
    required: true,
    onUnauthenticated: () => {
      setIsAuthenticated(false);
      setLoading(false);
    },
  });

  // State for authentication status and user data
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(session.status === 'authenticated');
  const [loading, setLoading] = useState<boolean>(session.status === 'loading');
  const [error, setError] = useState<Error | null>(null);

  const login = async (username: string, password: string, callbackUrl: string = '/account'): Promise<void> => {
    try {
      await signIn('credentials', { username, password, callbackUrl });
    } catch (error) {
      setError(error instanceof Error ? error : new Error('Failed to log in'));
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await signOut();
    } catch (error) {
      setError(error instanceof Error ? error : new Error('Failed to log out'));
    } finally {
      setLoading(false);
    }
  };

  return {
    isAuthenticated,
    error,
    loading,
    login,
    logout,
  };
};

export default useAuthentication;
