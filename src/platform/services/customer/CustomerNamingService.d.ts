import { Customer } from '../model/customer/customer';

/**
 * Service for customer naming operations
 */
export interface CustomerNamingService {
  /**
   * Returns the salutation of the customer
   * @param customer The customer to get the salutation for
   * @returns The salutation of the customer
   */
  getSalutation(customer: Customer): string;
  /**
   * Returns the full name of the customer
   * @param customer The customer to get the full name for
   * @returns The full name of the customer
   */
  getFullName(customer: Customer): string;
  /**
   * Returns the short name of the customer
   * @param customer The customer to get the short name for
   * @returns The short name of the customer
   */
  getShortName(customer: Customer): string;
}
