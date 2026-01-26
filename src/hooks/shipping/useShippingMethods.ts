'use client';

import { useCallback, useState } from 'react';
import { getLogger } from '@/lib/logger/use-logger-client';
import type { ShippingMethod } from '@/platform/services/model/shipping';
import { useShippingMethodsStore } from '@/providers/StoreProvider';

interface UseShippingMethods {
  // Data
  shippingMethods: ShippingMethod[];
  loading: boolean;
  error: Error | null;

  // Actions
  fetchShippingMethods: (
    countryCode: string,
    postalCode: string,
    orderValue?: { amount: number; currency: string },
  ) => Promise<void>;
  clearShippingMethods: () => void;
}

/**
 * Hook for managing shipping methods
 * @returns Shipping methods data and operations
 */
export const useShippingMethods = (): UseShippingMethods => {
  const { shippingMethods, loading, getLoading, setLoading, setShippingMethods } = useShippingMethodsStore();
  const [error, setError] = useState<Error | null>(null);
  const fetchShippingMethods = useCallback(
    async (
      countryCode: string,
      postalCode: string,
      orderValue?: { amount: number; currency: string },
    ): Promise<void> => {
      if (!countryCode || !postalCode) {
        return;
      }
      if (getLoading()) {
        return;
      }
      setError(null);
      setLoading(true);

      try {
        const { getShippingMethods } = await import('@/lib/client/shipping');
        const methods = await getShippingMethods(countryCode, postalCode, orderValue);
        setShippingMethods(methods);
      } catch (err) {
        getLogger().error({ err }, 'Error fetching shipping methods');
        setError(err instanceof Error ? err : new Error('Failed to fetch shipping methods'));
      } finally {
        setLoading(false);
      }
    },
    [setShippingMethods, setLoading, getLoading],
  );

  const clearShippingMethods = useCallback(() => {
    setShippingMethods([]);
  }, [setShippingMethods]);

  return {
    shippingMethods,
    loading,
    error,
    fetchShippingMethods,
    clearShippingMethods,
  };
};
