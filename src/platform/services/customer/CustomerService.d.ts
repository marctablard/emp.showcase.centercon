import { Address } from '../model/common';
import { Customer } from '../model/customer/customer';

/**
 * Data transfer object for password change
 */
export interface PasswordChangeDto {
  /**
   * The current password of the customer
   */
  currentPassword: string;
  /**
   * The new password to set
   */
  newPassword: string;
}

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
   * Create a new address for the current customer
   * @param address The address data to create
   * @returns Promise with the created address including its ID
   */
  createAddress(address: Address): Promise<Address>;

  /**
   * Update an existing address
   * @param addressId The ID of the address to update
   * @param address The address data to update
   * @returns Promise with the updated address
   */
  updateAddress(addressId: string, address: Address): Promise<Address>;

  /**
   * Delete an address
   * @param addressId The ID of the address to delete
   * @returns Promise that resolves when deletion is complete
   */
  deleteAddress(addressId: string): Promise<void>;

  /**
   * Change the password of the current customer
   * @param passwordData Object containing the current and new password
   * @returns Promise that resolves when the password change is complete
   */
  changePassword(passwordData: PasswordChangeDto): Promise<void>;

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

  /**
   * Create a new address for the current customer
   * @param address The address data to create
   * @returns Promise with the created address including its ID
   */
  createAddress(address: Address): Promise<Address>;

  /**
   * Update an existing address
   * @param addressId The ID of the address to update
   * @param address The address data to update
   * @returns Promise with the updated address
   */
  updateAddress(addressId: string, address: Address): Promise<Address>;

  /**
   * Delete an address
   * @param addressId The ID of the address to delete
   * @returns Promise that resolves when deletion is complete
   */
  deleteAddress(addressId: string): Promise<void>;
}
