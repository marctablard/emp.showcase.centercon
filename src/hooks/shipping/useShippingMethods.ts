'use client';

import { useCallback, useEffect, useState } from 'react';
import type { ShippingMethod } from '@/platform/services/model/shipping';
import { useShippingMethodsStore } from '@/providers/StoreProvider';

interface UseShippingMethods {
  // Data
  shippingMethods: ShippingMethod[] | null;
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
  /**
   * Fetch shipping methods for a given country and postal code
   */
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
        console.error('Error fetching shipping methods:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch shipping methods'));
      } finally {
        setLoading(false);
      }
    },
    [setShippingMethods, setLoading],
  );

  /**
   * Clear shipping methods from the store
   */
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
