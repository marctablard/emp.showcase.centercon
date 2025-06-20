import { useCallback, useEffect, useState } from 'react';
import {
  createCustomerAddress,
  deleteCustomerAddress,
  fetchCustomerAddresses,
  updateCustomerAddress,
} from '@/lib/client/customer';
import { Address, AddressType } from '@/platform/services/model/common';
import { useCustomerStore } from '@/providers/StoreProvider';

interface CustomerHook {
  addresses: Address[] | undefined;
  loading: boolean;
  error: Error | null;
  fetchAddresses: () => Promise<void>;
  getDefaultAddress: (type: AddressType) => Address | null;
  createAddress: (address: Partial<Address>) => Promise<Address>;
  updateAddress: (id: string, address: Partial<Address>) => Promise<Address>;
  deleteAddress: (id: string) => Promise<void>;
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

  // Create a new address
  const createAddress = useCallback(
    async (address: Partial<Address>): Promise<Address> => {
      try {
        setAddressLoading(true);
        setError(null);
        const newAddress = await createCustomerAddress(address);
        // Update the addresses list
        const updatedAddresses = addresses ? [...addresses, newAddress] : [newAddress];
        setAddresses(updatedAddresses);
        setStoreAddresses(updatedAddresses);
        return newAddress;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to create address');
        setError(error);
        console.error('Error creating address:', err);
        throw error;
      } finally {
        setAddressLoading(false);
      }
    },
    [addresses, setAddressLoading, setStoreAddresses],
  );

  // Update an existing address
  const updateAddress = useCallback(
    async (id: string, address: Partial<Address>): Promise<Address> => {
      try {
        setAddressLoading(true);
        setError(null);
        const updatedAddress = await updateCustomerAddress(id, address);
        // Update the addresses list
        const updatedAddresses = addresses?.map((addr) =>
          addr.id === id || (addr as any)._id === id ? updatedAddress : addr,
        );
        setAddresses(updatedAddresses);
        setStoreAddresses(updatedAddresses);
        return updatedAddress;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to update address');
        setError(error);
        console.error('Error updating address:', err);
        throw error;
      } finally {
        setAddressLoading(false);
      }
    },
    [addresses, setAddressLoading, setStoreAddresses],
  );

  // Delete an address
  const deleteAddress = useCallback(
    async (id: string): Promise<void> => {
      try {
        setAddressLoading(true);
        setError(null);
        await deleteCustomerAddress(id);
        // Remove the address from the list
        const updatedAddresses = addresses?.filter((addr) => addr.id !== id && (addr as any)._id !== id);
        setAddresses(updatedAddresses);
        setStoreAddresses(updatedAddresses);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to delete address');
        setError(error);
        console.error('Error deleting address:', err);
        throw error;
      } finally {
        setAddressLoading(false);
      }
    },
    [addresses, setAddressLoading, setStoreAddresses],
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
    createAddress,
    updateAddress,
    deleteAddress,
  };
};
