import { inject } from 'inversify';
import { injectable } from '@/platform/core/di/injectable';
import type { CartApi } from '@/platform/integrations/emporix/cart/CartApi';
import type { CartMigrationService } from '@/platform/services/cart/CartMigrationService';
import type { CustomerService } from '../../customer/CustomerService';

/**
 * Implementation of CartService for Emporix cart data.
 * Maps between Emporix API cart format and internal Cart model.
 */
@injectable('CartMigrationService', 'Singleton')
class EmporixCartMigrationService implements CartMigrationService {
  private customerService: CustomerService;
  private cartApi: CartApi;

  constructor(@inject('CustomerService') customerService: CustomerService, @inject('EmporixCartApi') cartApi: CartApi) {
    this.customerService = customerService;
    this.cartApi = cartApi;
  }

  async migrateCartToCurrentCustomer(cartId: string): Promise<void> {
    const cart = await this.cartApi.getCart(cartId);
    if (!cart) {
      throw new Error('No Cart for Migration found');
    }
    const customer = await this.customerService.getCurrentCustomer();
    if (!customer) {
      throw new Error('No Customer for Migration found');
    }
    this.cartApi.updateCart(cartId, {
      customerId: customer.id,
    });
  }

  async mergeCarts(sourceCartId: string, targetCartId: string): Promise<void> {
    // TODO Cart-Merging
    throw new Error('Method not implemented.');
  }
}

export default EmporixCartMigrationService;
