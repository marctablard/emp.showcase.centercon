import { Customer } from '../model/customer/customer';

/**
 * Service for customer-related operations
 */
export interface CustomerService {
  /**
   * Get the current logged-in customer
   * @returns Promise with the current customer or null if not logged in
   */
  getCurrentCustomer(): Promise<Customer | null>;
}
