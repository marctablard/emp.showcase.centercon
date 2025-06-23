import { inject } from 'inversify';
import { injectable } from '@/platform/core/di/injectable';
import type { CartApi } from '@/platform/integrations/emporix/cart/CartApi';
import type { CartMigrationService } from '@/platform/services/cart/CartMigrationService';
import { Cart } from '../../model/cart';

/**
 * Implementation of CartService for Emporix cart data.
 * Maps between Emporix API cart format and internal Cart model.
 */
@injectable('CartMigrationService', 'Singleton')
class EmporixCartMigrationService implements CartMigrationService {
  constructor(@inject('EmporixCartApi') private cartApi: CartApi) {}

  async migrateCartToCustomer(cartId: string, customerId: string): Promise<void> {
    const cart = await this.cartApi.getCart(cartId);
    if (!cart) {
      // TODO what if someone came in with an outdated cart cookie?
      return;
    }
    // TODO handle a situation where the Customer already has a Cart (separate Ticket)
    await this.cartApi.updateCart(cartId, {
      customerId: customerId,
    });
  }

  async mergeCarts(_sourceCartId: string, _targetCartId: string): Promise<Cart> {
    // TODO Cart-Merging
    throw new Error('Method not implemented.');
  }
}

export default EmporixCartMigrationService;
