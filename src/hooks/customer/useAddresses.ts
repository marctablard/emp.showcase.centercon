import { useCallback, useEffect, useState } from 'react';
import { fetchCustomerAddresses } from '@/lib/client/customer';
import { Address, AddressType } from '@/platform/services/model/common';
import { useCustomerStore } from '@/providers/StoreProvider';

interface CustomerHook {
  addresses: Address[] | undefined;
  loading: boolean;
  error: Error | null;
  fetchAddresses: () => Promise<void>;
  getDefaultAddress: (type: AddressType) => Address | null;
}

/**
 * Hook for customer data
 * @returns Customer data and state
 */
export const useAddresses = (initialAddresses?: Address[] | undefined): CustomerHook => {
  const {
    addresses: storeAddresses,
    loading,
    getAddressLoading,
    setAddressLoading,
    setAddresses: setStoreAddresses,
    getAddresses,
  } = useCustomerStore();

  const [addresses, setAddresses] = useState<Address[] | undefined>(initialAddresses || storeAddresses);
  const [error, setError] = useState<Error | null>(null);

  const fetchAddresses = useCallback(async () => {
    try {
      setAddressLoading(true);
      setError(null);
      const addressData = await fetchCustomerAddresses();
      setStoreAddresses(addressData);
      setAddresses(addressData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch addresses'));
      console.error('Error fetching addresses:', err);
    } finally {
      setAddressLoading(false);
    }
  }, [setAddressLoading, setStoreAddresses]);

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

  // Initialize customer on first render if not already initialized
  useEffect(() => {
    if (addresses === undefined && !getAddressLoading()) {
      setAddressLoading(true);
      // first try to grab the customer from the store
      const currentAddresses = getAddresses();
      if (currentAddresses !== undefined) {
        setAddresses(currentAddresses);
        setAddressLoading(false);
      } else {
        fetchAddresses();
      }
    }
  }, [addresses, getAddresses, getAddressLoading, setAddressLoading, fetchAddresses]);

  return {
    addresses,
    loading,
    error,
    fetchAddresses,
    getDefaultAddress,
  };
};
