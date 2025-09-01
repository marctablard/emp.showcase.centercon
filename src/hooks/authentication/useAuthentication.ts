'use client';

import { useEffect, useState } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useRouter } from '@/i18n/navigation';
import { useCartStore, useCustomerStore } from '@/providers/StoreProvider';
import { clearAllPersistedStores } from '@/utils/storeUtils';
import { useCheckout } from '../checkout/useCheckout';
import { useAddresses } from '../customer/useAddresses';

interface AuthenticationHook {
  isAuthenticated: boolean;
  error: Error | null;
  loading: boolean;
  login: (username: string, password: string, redirect?: boolean, callbackUrl?: string) => Promise<void>;
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
  const { reset } = useCheckout();
  const router = useRouter();
  const { fetchAddresses } = useAddresses();

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
  ): Promise<void> => {
    setLoading(true);
    try {
      const response = await signIn('credentials', {
        username,
        password,
        redirect: false,
      });
      if (response?.error) {
        setError(new Error(response.error));
      } else {
        setIsAuthenticated(true);
        reset();
        await fetchAddresses();
        if (redirect) {
          router.push(callbackUrl);
        }
      }
    } catch (error) {
      setError(error instanceof Error ? error : new Error('Failed to log in'));
    } finally {
      setLoading(false);
    }
  };

  const cartStore = useCartStore();
  const customerStore = useCustomerStore();

  const logout = async (): Promise<void> => {
    try {
      setLoading(true);

      await signOut({
        redirect: false,
      });

      // After signOut is complete, clear all stores
      cartStore.clearCart();
      customerStore.reset();

      // Clear all persisted store data
      clearAllPersistedStores();

      router.push('/?logout');
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
