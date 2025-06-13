import { Customer } from '@/platform/services/model/customer/customer';

/**
 * Fetch the current customer information
 * @returns {Promise<Customer|null>} The customer or null if not logged in
 */
export async function fetchCurrentCustomer(): Promise<Customer | null> {
  try {
    const response = await fetch('/api/customer');
    
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
