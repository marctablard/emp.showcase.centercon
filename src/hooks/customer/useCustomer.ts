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
}

/**
 * Hook for customer data
 * @returns Customer data and state
 */
export const useCustomer = (initialCustomer?: Customer | null): CustomerHook => {
  const {
    customer: storeCustomer,
    loading,
    getLoading,
    setLoading,
    setCustomer: setStoreCustomer,
    getCustomer: getStoreCustomer,
  } = useCustomerStore();
  if (initialCustomer && getStoreCustomer() === undefined) {
    setStoreCustomer(initialCustomer);
  }
  const [customer, setCustomer] = useState<Customer | null | undefined>(initialCustomer || storeCustomer);
  const [error, setError] = useState<Error | null>(null);

  const fetchCustomer = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchCurrentCustomer();
      setStoreCustomer(data);
      setCustomer(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch customer'));
      console.error('Error fetching customer:', err);
    } finally {
      setLoading(false);
    }
  }, [setLoading, setStoreCustomer]);

  // Initialize customer on first render if not already initialized
  useEffect(() => {
    if (customer === undefined && !getLoading()) {
      setLoading(true);
      // first try to grab the customer from the store
      const currentCustomer = getStoreCustomer();
      if (currentCustomer !== undefined) {
        setCustomer(currentCustomer);
        setLoading(false);
      } else {
        fetchCustomer();
      }
    }
  }, [customer, getStoreCustomer, getLoading, setLoading, fetchCustomer]);

  return {
    customer,
    loading,
    error,
    fetchCustomer,
  };
};

export default useCustomer;
