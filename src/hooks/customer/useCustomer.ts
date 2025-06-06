'use client';

import { useState, useEffect } from 'react';
import { Customer } from '@/platform/services/model/customer/customer';
import { fetchCurrentCustomer } from '@/lib/client/customer';

interface CustomerHook {
  customer: Customer | null;
  loading: boolean;
  error: Error | null
}

/**
 * Hook for customer data
 * @returns Customer data and state
 */
export const useCustomer = (): CustomerHook => {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
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
    fetchCustomer();
  }, []);

  return {
    customer,
    loading,
    error
  };
};

export default useCustomer;
