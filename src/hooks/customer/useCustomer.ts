'use client';

import { useState } from 'react';
import { Customer } from '@/platform/services/model/customer/customer';

interface CustomerHook {
  customer: Customer | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Hook for customer data
 * @returns Customer data and state
 */
export const useCustomer = (): CustomerHook => {
  // Mock data for customer
  const mockCustomer: Customer = {
    id: 'cust-123456',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    contactPhone: '+1 (555) 123-4567',
  };

  const [customer] = useState<Customer | null>(mockCustomer);
  const [loading] = useState<boolean>(false);
  const [error] = useState<Error | null>(null);

  return {
    customer,
    loading,
    error,
  };
};

export default useCustomer;
