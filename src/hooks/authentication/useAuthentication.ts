'use client';

import { useEffect, useState } from 'react';
import type { SignInResponse } from 'next-auth/react';
import { signIn, signOut, useSession } from 'next-auth/react';

interface AuthenticationHook {
  isAuthenticated: boolean;
  error: Error | null;
  loading: boolean;
  login: (
    username: string,
    password: string,
    redirect?: boolean,
    callbackUrl?: string,
  ) => Promise<SignInResponse | undefined>;
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

  // Update authentication state when session status changes
  useEffect(() => {
    setIsAuthenticated(session.status === 'authenticated');
    setLoading(session.status === 'loading');
  }, [session.status]);

  const login = async (
    username: string,
    password: string,
    redirect: boolean = true,
    callbackUrl: string = '/account',
  ): Promise<SignInResponse | undefined> => {
    setLoading(true);
    try {
      return await signIn('credentials', {
        username,
        password,
        redirect,
        callbackUrl,
      });
    } catch (error) {
      setError(error instanceof Error ? error : new Error('Failed to log in'));
      return {
        ok: false,
        error: 'UnknownError',
        status: 500,
        url: null,
      };
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
