import { cache } from 'react';
import type { CustomerService } from '@/platform/services/customer/CustomerService';
import type { Customer } from '@/platform/services/model/customer/customer';

/**
 * Get the customer service instance from the platform container
 */
const getCustomerService = () => globalThis.EMP.platform.ssr.get<CustomerService>('CustomerService');

/**
 * Get the current customer
 * This function is cached to prevent multiple customer fetches in a single request
 */
export const getCurrentCustomer = cache(async (): Promise<Customer | null> => {
  try {
    const customerService = getCustomerService();
    const customer = await customerService.getCustomer();
    return customer;
  } catch (error) {
    console.error('Error fetching customer in SSR:', error);
    return null;
  }
});

/**
 * Check if a user is logged in
 * This is a convenience method that can be used in server components
 */
export async function isLoggedIn(): Promise<boolean> {
  const customer = await getCurrentCustomer();
  return customer !== null;
}
