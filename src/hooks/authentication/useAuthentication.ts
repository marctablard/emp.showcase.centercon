'use client';

import { useEffect, useState, useTransition } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useLocale } from 'next-intl';
import { getPathname } from '@/i18n/navigation';
import { clearAllPersistedStores } from '@/utils/storeUtils';
import { useCheckout } from '../checkout/useCheckout';
import { useSite } from '../site/useSite';

interface AuthenticationHook {
  isAuthenticated: boolean;
  error: Error | null;
  loading: boolean;
  login: (username: string, password: string, callbackUrl?: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

/**
 * Hook for authentication functionality
 * @returns Authentication state and functions
 */
export const useAuthentication = (): AuthenticationHook => {
  const locale = useLocale();
  const { site } = useSite();
  const session = useSession({
    required: true,
    onUnauthenticated: () => {
      setIsAuthenticated(false);
      setLoading(false);
    },
  });

  // State for authentication status and user data
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { reset } = useCheckout();
  const [_isPending, startTransition] = useTransition();

  // Update authentication state when session status changes
  useEffect(() => {
    setIsAuthenticated(session.status === 'authenticated');
    setLoading(session.status === 'loading');
    // Since the session object itself is stable, we only need to watch the status property
  }, [session.status]);

  const login = async (username: string, password: string, callbackUrl?: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    let success = false;
    // Validate callbackUrl to prevent open redirect attacks
    const safeCallbackUrl = callbackUrl
      ? callbackUrl.startsWith('/') && !callbackUrl.startsWith('//')
        ? callbackUrl
        : '/account'
      : undefined;
    try {
      const data = await signIn('credentials', {
        username,
        password,
        redirect: false,
        redirectTo: safeCallbackUrl ? safeCallbackUrl + '?login=success' : undefined,
      });

      if (data?.error) {
        setError(new Error(data.error));
        setIsAuthenticated(false);
      } else {
        setIsAuthenticated(true);
        reset();
        if (safeCallbackUrl) {
          window.location.href = getPathname({ href: safeCallbackUrl + '?login=success', locale, site: site?.code });
        }
        success = true;
      }
    } catch (error) {
      setError(error instanceof Error ? error : new Error('Failed to log in'));
    } finally {
      setLoading(false);
    }
    return success;
  };

  const logout = async (): Promise<void> => {
    try {
      setLoading(true);
      startTransition(async () => {
        // Clear all persisted store data
        clearAllPersistedStores();
        const logoutTarget = getPathname({ href: '/', locale, site: site?.code });
        // ...then log out (no idea how this could fail)
        await signOut({
          redirect: true,
          redirectTo: logoutTarget,
        });
      });
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
