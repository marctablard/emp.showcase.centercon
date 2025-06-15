'use client';

import { useCallback, useEffect, useState } from 'react';
import { fetchCurrentCustomer, fetchCustomerAddresses } from '@/lib/client/customer';
import { Address, AddressType, Address as BaseAddress } from '@/platform/services/model/common';
import type { Customer } from '@/platform/services/model/customer/customer';
import { useCustomerStore } from '@/providers/StoreProvider';

interface CustomerHook {
  customer: Customer | null | undefined;
  addresses: Address[] | undefined;
  loading: boolean;
  error: Error | null;
  fetchCustomer: () => Promise<void>;
  getDefaultAddress: (type: AddressType) => Address | null;
  addressLoading: boolean;
}

/**
 * Hook for customer data
 * @returns Customer data and state
 */
export const useCustomer = (): CustomerHook => {
  const {
    customer,
    addresses,
    loading,
    getLoading,
    setLoading,
    setCustomer,
    setAddresses,
    getAddressLoading,
    setAddressLoading,
  } = useCustomerStore();
  const [error, setError] = useState<Error | null>(null);
  const [addressLoading, setLocalAddressLoading] = useState<boolean>(getAddressLoading());

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

  // Fetch customer addresses
  const loadAddresses = useCallback(async () => {
    if (!customer) return;
    if (getAddressLoading()) return;

    try {
      setAddressLoading(true);
      const addressData = await fetchCustomerAddresses();
      setAddresses(addressData);
    } catch (err) {
      console.error('Error fetching addresses:', err);
    } finally {
      setAddressLoading(false);
    }
  }, [customer, setAddressLoading]);

  useEffect(() => {
    if (!getLoading() && customer === undefined) {
      fetchCustomer();
    }
  }, [getLoading, customer, fetchCustomer]);

  useEffect(() => {
    setLocalAddressLoading(getAddressLoading());
  }, [getAddressLoading]);

  // Load addresses when customer is loaded
  useEffect(() => {
    if (customer && addresses === undefined && !addressLoading) {
      loadAddresses();
    }
  }, [customer, loadAddresses, addressLoading, addresses]);

  /**
   * Get default address of specified type
   * @param type Address type (SHIPPING or BILLING)
   * @returns Default address of specified type or null if not found
   */
  const getDefaultAddress = useCallback(
    (type: AddressType): Address | null => {
      if ((addresses || []).length === 0) {
        return null;
      }

      // If no default address of the specified type is found, just return the first address of that type
      const firstTypeAddress = (addresses || []).find((addr) => addr.types.includes(type));

      if (firstTypeAddress) {
        return firstTypeAddress;
      }

      return null;
    },
    [addresses],
  );

  return {
    customer,
    addresses,
    loading,
    error,
    fetchCustomer,
    addressLoading,
    getDefaultAddress,
  };
};

export default useCustomer;
