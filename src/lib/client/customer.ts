import { Address } from '@/platform/services/model/common';
import { Customer } from '@/platform/services/model/customer/customer';

/**
 * Fetch the current customer information
 * @returns {Promise<Customer|null>} The customer or null if not logged in
 */
export async function fetchCurrentCustomer(): Promise<Customer | null> {
  try {
    const response = await fetch('/api/customer/current');

    // If we get a 204, it means no customer is logged in
    if (response.status === 204) {
      return null;
    }

    // For other error codes, throw an error
    if (!response.ok) {
      throw new Error(`Failed to fetch customer: ${response.statusText}`);
    }

    const customer = await response.json();
    return customer;
  } catch (error) {
    console.error('Error fetching customer:', error);
    return null;
  }
}

/**
 * Fetch addresses for the current customer
 * @returns {Promise<Address[]>} Array of customer addresses
 */
export async function fetchCustomerAddresses(): Promise<Address[]> {
  try {
    const response = await fetch('/api/customer/current/addresses');

    // For error codes, throw an error
    if (!response.ok) {
      throw new Error(`Failed to fetch customer addresses: ${response.statusText}`);
    }

    const addresses = await response.json();
    return addresses;
  } catch (error) {
    console.error('Error fetching customer addresses:', error);
    return [];
  }
}

/**
 * Create a new address for the current customer
 * @param {Address} address - The address data to save
 * @returns {Promise<Address>} The saved address with ID
 */
export async function createCustomerAddress(address: Partial<Address>): Promise<Address> {
  try {
    const response = await fetch('/api/customer/current/addresses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(address),
    });

    if (!response.ok) {
      throw new Error(`Failed to create customer address: ${response.statusText}`);
    }

    const savedAddress = await response.json();
    return savedAddress;
  } catch (error) {
    console.error('Error creating customer address:', error);
    throw error;
  }
}

/**
 * Update an existing customer address
 * @param {string} id - The ID of the address to update
 * @param {Address} address - The updated address data
 * @returns {Promise<Address>} The updated address
 */
export async function updateCustomerAddress(id: string, address: Partial<Address>): Promise<Address> {
  try {
    const response = await fetch(`/api/customer/current/addresses/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(address),
    });

    if (!response.ok) {
      throw new Error(`Failed to update customer address: ${response.statusText}`);
    }

    const updatedAddress = await response.json();
    return updatedAddress;
  } catch (error) {
    console.error('Error updating customer address:', error);
    throw error;
  }
}

/**
 * Delete a customer address
 * @param {string} id - The ID of the address to delete
 * @returns {Promise<void>}
 */
export async function deleteCustomerAddress(id: string): Promise<void> {
  try {
    const response = await fetch(`/api/customer/current/addresses/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to delete customer address: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error deleting customer address:', error);
    throw error;
  }
}
