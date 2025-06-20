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

  /**
   * Request a password reset for a customer's email address
   * @param email The customer's email address
   * @returns Promise that resolves when the password reset request is complete
   */
  passwordReset(email: string): Promise<void>;

  /**
   * Request a password reset for a customer's email address
   * @param token the Password Reset Token
   * @param password the new Password
   * @returns Promise that resolves when the password reset update is complete
   */
  passwordResetUpdate(token: string, password: string): Promise<void>;
}
