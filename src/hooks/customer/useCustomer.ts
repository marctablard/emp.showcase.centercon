'use client';

import { useCallback, useEffect, useState } from 'react';
import { fetchCurrentCustomer } from '@/lib/client/customer';
import type { Customer } from '@/platform/services/model/customer/customer';
import { useCustomerStore } from '@/providers/StoreProvider';

interface CustomerHook {
  customer: Customer | null | undefined;
  loading: boolean;
  error: Error | null;
  fetchCustomer: () => Promise<void>;
  reset: () => void;
}

/**
 * Hook for customer data
 * @returns Customer data and state
 */
export const useCustomer = (initialCustomer?: Customer | null): CustomerHook => {
  const { customer, loading, getLoading, setLoading, setCustomer, getCustomer, reset } = useCustomerStore();
  if (initialCustomer && getCustomer() === undefined) {
    setCustomer(initialCustomer);
  }
  const [error, setError] = useState<Error | null>(null);

  const fetchCustomer = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchCurrentCustomer();
      setCustomer(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch customer'));
      console.error('Error fetching customer:', err);
    } finally {
      setLoading(false);
    }
  }, [setLoading, setCustomer]);

  // Initialize customer on first render if not already initialized
  useEffect(() => {
    if (customer === undefined && !getLoading()) {
      setLoading(true);
      // check without state-effect
      if (getCustomer() !== undefined) {
        setLoading(false);
      } else {
        fetchCustomer();
      }
    }
  }, [customer, getCustomer, getLoading, setLoading, fetchCustomer]);

  return {
    customer,
    loading,
    error,
    fetchCustomer,
    reset,
  };
};

export default useCustomer;
