import { inject } from 'inversify';
import { injectable } from '@/platform/core/di/injectable';
import type { CustomerApi } from '@/platform/integrations/emporix/customer/CustomerApi';
import type { SessionContextApi } from '@/platform/integrations/emporix/session/SessionContextApi';
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
    @inject('EmporixSessionContextApi') private sessionContextApi: SessionContextApi,
  ) {
    this.customerApi = customerApi;
    this.sessionContextApi = sessionContextApi;
  }

  /**
   * Get the current logged-in customer
   * @returns Promise with the current customer or null if not logged in
   */
  async getCurrentCustomer(): Promise<Customer | null> {
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
}

export default EmporixCustomerService;
