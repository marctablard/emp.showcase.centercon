'use client';

import { useCallback, useEffect, useState } from 'react';
import type { ShippingMethod } from '@/platform/services/model/shipping';
import { useSiteStore } from '@/stores/site-store';

interface UseShippingMethods {
  // Data
  shippingMethods: ShippingMethod[];
  loading: boolean;
  error: Error | null;
  
  // Actions
  fetchShippingMethods: (countryCode: string, postalCode: string) => Promise<void>;
  clearShippingMethods: () => void;
  getShippingMethodById: (id: string) => ShippingMethod | undefined;
}

/**
 * Hook for managing shipping methods
 * @returns Shipping methods data and operations
 */
export const useShippingMethods = (): UseShippingMethods => {
  // Get site store data
  const {
    shippingMethods: storeMethods,
    shippingMethodsLoading: storeLoading,
    setShippingMethods,
    setShippingMethodsLoading,
  } = useSiteStore();
  
  const [error, setError] = useState<Error | null>(null);
  
  /**
   * Fetch shipping methods for a given country and postal code
   */
  const fetchShippingMethods = useCallback(
    async (countryCode: string, postalCode: string): Promise<void> => {
      if (!countryCode || !postalCode) {
        return;
      }
      
      setError(null);
      setShippingMethodsLoading(true);
      
      try {
        const { getShippingMethods } = await import('@/lib/client/shipping');
        const methods = await getShippingMethods(countryCode, postalCode);
        setShippingMethods(methods);
      } catch (err) {
        console.error('Error fetching shipping methods:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch shipping methods'));
      } finally {
        setShippingMethodsLoading(false);
      }
    },
    [setShippingMethods, setShippingMethodsLoading]
  );
  
  /**
   * Clear shipping methods from the store
   */
  const clearShippingMethods = useCallback(() => {
    setShippingMethods([]);
  }, [setShippingMethods]);
  
  /**
   * Get a shipping method by its ID
   */
  const getShippingMethodById = useCallback(
    (id: string): ShippingMethod | undefined => {
      return storeMethods.find((method) => method.id === id);
    },
    [storeMethods]
  );
  
  return {
    shippingMethods: storeMethods,
    loading: storeLoading,
    error,
    fetchShippingMethods,
    clearShippingMethods,
    getShippingMethodById,
  };
};
