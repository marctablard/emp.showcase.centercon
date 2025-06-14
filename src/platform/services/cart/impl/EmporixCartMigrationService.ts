import { inject } from 'inversify';
import { injectable } from '@/platform/core/di/injectable';
import type { CartApi } from '@/platform/integrations/emporix/cart/CartApi';
import { EmporixSessionContext } from '@/platform/integrations/emporix/model/session-context';
import EmporixSessionContextApi from '@/platform/integrations/emporix/session/impl/EmporixSessionContextApi';
import type { CartMigrationService } from '@/platform/services/cart/CartMigrationService';
import type { CustomerService } from '../../customer/CustomerService';
import { Cart } from '../../model/cart';

/**
 * Implementation of CartService for Emporix cart data.
 * Maps between Emporix API cart format and internal Cart model.
 */
@injectable('CartMigrationService', 'Singleton')
class EmporixCartMigrationService implements CartMigrationService {
  constructor(
    // The Customer may be from another Identity Provider, but Cart and Session have to be in sync on Emporix side.
    @inject('CustomerService') private customerService: CustomerService,
    @inject('EmporixSessionContextApi') private sessionContextApi: EmporixSessionContextApi,
    @inject('EmporixCartApi') private cartApi: CartApi,
  ) {}

  async migrateSessionCartToCurrentCustomer() {
    const customer = await this.customerService.getCurrentCustomer();
    if (!customer) {
      throw new Error('No Customer for Migration found');
    }
    const session = await this.sessionContextApi.getOwnSessionContext();
    if (!session) {
      throw new Error('No Session for Migration found');
    }
    if (!session.siteCode) {
      throw new Error('No SiteCode for Migration found');
    }
    const cart = await this.cartApi.getCartByCriteria(session.siteCode, session.sessionId, undefined, 'shopping');
    if (!cart) {
      return null;
    }
    await this.migrateCartToCustomer(cart.id, customer.id);
    const contextUpdate: Partial<EmporixSessionContext> = {
      cartId: cart.id,
      currency: cart.currency,
      metadata: {
        version: session.metadata?.version || 1,
      },
    };
    if (cart.countryCode) {
      contextUpdate.targetLocation = cart.countryCode;
    }
    await this.sessionContextApi.updateOwnSessionContext(contextUpdate);
    return cart.id;
  }

  async migrateCartToCustomer(cartId: string, customerId: string): Promise<void> {
    const cart = await this.cartApi.getCart(cartId);
    if (!cart) {
      throw new Error('No Cart for Migration found with given id: ' + cartId);
    }
    // TODO handle a situation where the Customer already has a Cart (separate Ticket)
    this.cartApi.updateCart(cartId, {
      customerId: customerId,
    });
  }

  async mergeCarts(_sourceCartId: string, _targetCartId: string): Promise<Cart> {
    // TODO Cart-Merging
    throw new Error('Method not implemented.');
  }
}

export default EmporixCartMigrationService;
