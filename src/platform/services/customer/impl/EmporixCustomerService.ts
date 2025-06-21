import { inject } from 'inversify';
import { injectable } from '@/platform/core/di/injectable';
import type { CustomerApi } from '@/platform/integrations/emporix/customer/CustomerApi';
import type { EmporixSessionContextApi } from '@/platform/integrations/emporix/session/EmporixSessionContextApi';
import { Address } from '../../model/common';
import EmporixAddressMapper from '../../model/common/impl/EmporixAddressMapper';
import { Customer } from '../../model/customer/customer';
import { CustomerService } from '../CustomerService';

const ANONYMOUS_CUSTOMER_ID = '00000000';

/**
 * Emporix implementation of the CustomerService
 * Currently returns null for getCurrentCustomer as requested
 */
@injectable('CustomerService', 'Singleton')
export class EmporixCustomerService implements CustomerService {
  constructor(
    @inject('EmporixCustomerApi') private customerApi: CustomerApi,
    @inject('EmporixSessionContextApi') private sessionContextApi: EmporixSessionContextApi,
    @inject('EmporixAddressMapper') private addressMapper: EmporixAddressMapper,
  ) {}

  /**
   * Get the current logged-in customer
   * @returns Promise with the current customer or null if not logged in
   */
  async getCustomer(customerId?: string): Promise<Customer | null> {
    if (customerId) {
      throw new Error('Not implemented');
    }
    try {
      const response = await this.customerApi.getCustomerProfile();
      // return null for Anonymous for clear differentiation
      if (!response || response.id == ANONYMOUS_CUSTOMER_ID) {
        return null;
      }
      return {
        id: response.id,
        email: response.contactEmail || '',
        firstName: response.firstName,
        lastName: response.lastName,
        company: response.company,
        language: response.preferredLanguage,
        currency: response.preferredCurrency,
        contactPhone: response.contactPhone,
      };
    } catch (error) {
      console.error('Error fetching customer:', error);
      return null;
    }
  }

  async getAddresses(customerId?: string): Promise<Address[]> {
    if (!customerId) {
      const addresses = await this.customerApi.getCustomerAddresses();
      return addresses.map(this.addressMapper.mapToService);
    }
    throw new Error('Not implemented');
  }

  /**
   * Create a new address for the current customer
   * @param address The address data to create
   * @returns Promise with the created address including its ID
   */
  async createAddress(address: Address): Promise<Address> {
    try {
      // Convert service model to Emporix model
      const emporixAddress = this.addressMapper.mapToSource(address);

      // Create address using API
      const result = await this.customerApi.addCustomerAddress(emporixAddress);

      // Get all addresses to find the newly created one
      const addresses = await this.customerApi.getCustomerAddresses();
      const createdAddress = addresses.find((addr) => addr.id === result.id);

      if (!createdAddress) {
        throw new Error('Failed to retrieve created address');
      }

      // Convert back to service model
      return this.addressMapper.mapToService(createdAddress);
    } catch (error) {
      console.error('Error creating customer address:', error);
      throw new Error(`Failed to create address: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update an existing address
   * @param addressId The ID of the address to update
   * @param address The address data to update
   * @returns Promise with the updated address
   */
  async updateAddress(addressId: string, address: Address): Promise<Address> {
    try {
      // Convert service model to Emporix model
      const emporixAddress = this.addressMapper.mapToSource(address);

      // Update address using API
      await this.customerApi.updateCustomerAddress(addressId, emporixAddress);

      // Get all addresses to find the updated one
      const addresses = await this.customerApi.getCustomerAddresses();
      const updatedAddress = addresses.find((addr) => addr.id === addressId);

      if (!updatedAddress) {
        throw new Error('Failed to retrieve updated address');
      }

      // Convert back to service model
      return this.addressMapper.mapToService(updatedAddress);
    } catch (error) {
      console.error('Error updating customer address:', error);
      throw new Error(`Failed to update address: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete an address
   * @param addressId The ID of the address to delete
   * @returns Promise that resolves when deletion is complete
   */
  async deleteAddress(addressId: string): Promise<void> {
    try {
      // Delete address using API
      await this.customerApi.deleteCustomerAddress(addressId);
    } catch (error) {
      console.error('Error deleting customer address:', error);
      throw new Error(`Failed to delete address: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  passwordReset(email: string): Promise<void> {
    return this.customerApi.passwordReset(email);
  }

  passwordResetUpdate(token: string, password: string): Promise<void> {
    return this.customerApi.passwordResetUpdate(token, password);
  }
}

export default EmporixCustomerService;
