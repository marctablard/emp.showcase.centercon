import { CustomerService } from '../CustomerService';
import { Customer } from '../../model/customer/customer';
import { injectable } from '@/platform/core/di/injectable';

/**
 * Emporix implementation of the CustomerService
 * Currently returns null for getCurrentCustomer as requested
 */
@injectable('CustomerService', 'Singleton')
export class EmporixCustomerService implements CustomerService {
  /**
   * Get the current logged-in customer
   * @returns Promise with the current customer or null if not logged in
   */
  async getCurrentCustomer(): Promise<Customer | null> {
    // For now, just return null as requested
    return null;
  }
}

export default EmporixCustomerService;