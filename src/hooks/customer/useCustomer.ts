'use client';

import { useEffect, useState } from 'react';
import { fetchCurrentCustomer } from '@/lib/client/customer';
import { Customer } from '@/platform/services/model/customer/customer';
import { useCustomerStore } from '@/providers/StoreProvider';

interface CustomerHook {
  customer: Customer | null | undefined;
  loading: boolean;
  error: Error | null;
}

/**
 * Hook for customer data
 * @returns Customer data and state
 */
export const useCustomer = (): CustomerHook => {
  const { customer, loading, getLoading, setLoading, setCustomer } = useCustomerStore();
  const [error, setError] = useState<Error | null>(null);

  const fetchCustomer = async () => {
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
  };

  useEffect(() => {
    if (!getLoading() && customer === undefined) {
      fetchCustomer();
    }
  }, [getLoading, customer, fetchCustomer]);

  return {
    customer,
    loading,
    error,
  };
};

export default useCustomer;
