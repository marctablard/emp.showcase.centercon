import { Address } from '../model/common';
import { Customer } from '../model/customer/customer';

/**
 * Service for customer-related operations
 */
export interface CustomerService {
  /**
   * Get the current logged-in customer
   * @returns Promise with the current customer or null if not logged in
   */
  getCustomer(customerId?: string): Promise<Customer | null>;

  /**
   * Get the list of addresses for the current customer
   * @returns Promise with the list of addresses or empty array if no addresses
   */
  getAddresses(customerId?: string): Promise<Address[]>;
}
