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
}

export default EmporixCustomerService;
