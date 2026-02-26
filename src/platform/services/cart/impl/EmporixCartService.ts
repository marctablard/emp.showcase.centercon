import { inject } from 'inversify';
import { l10n } from '@/lib/utils';
import { injectable } from '@/platform/core/di/injectable';
import type { EmporixCartApi } from '@/platform/integrations/emporix/cart/EmporixCartApi';
import type EmporixCommonUtil from '@/platform/integrations/emporix/common/util/EmporixCommonUtil';
import { EmporixAddCartItemRequest, EmporixUpdateCartItemRequest } from '@/platform/integrations/emporix/model';
import { EmporixCart, EmporixCartItem } from '@/platform/integrations/emporix/model/cart';
import type { CartService, ModifyCartItemResult } from '@/platform/services/cart/CartService';
import type { CartStatus, CartStatusDetailCode } from '@/platform/services/cart/CartService';
import type { LoggerService } from '@/platform/services/logger/LoggerService';
import type { Cart } from '@/platform/services/model/cart/cart';
import type { PriceService } from '@/platform/services/price/PriceService';
import type { ProductService } from '@/platform/services/product/ProductService';
import type { StockService } from '@/platform/services/stock/StockService';
import type { CartMapper } from '../../model/cart/CartMapper';
import { Media, Paginated, PaginationQuery } from '../../model/common';
import type { SessionService } from '../../session/SessionService';
import type { SiteService } from '../../site/SiteService';

/**
 * Implementation of CartService for Emporix cart data.
 * Maps between Emporix API cart format and internal Cart model.
 */
@injectable('CartService', 'Singleton')
class EmporixCartService implements CartService {
  constructor(
    @inject('EmporixCommonUtil') private commonUtil: EmporixCommonUtil,
    @inject('EmporixCartApi') private cartApi: EmporixCartApi,
    @inject('EmporixCartMapper') private mapper: CartMapper<EmporixCart, EmporixCartItem>,
    @inject('SessionService') private sessionService: SessionService,
    @inject('PriceService') private priceService: PriceService,
    @inject('ProductService') private productService: ProductService,
    @inject('StockService') private stockService: StockService,
    @inject('LoggerService') private logger: LoggerService,
    @inject('SiteService') private siteService: SiteService,
  ) {}

  async createCart(currency: string, siteCode: string): Promise<string> {
    // TODO extract these information to a SiteConfigService
    const createCartRequest = {
      siteCode,
      currency,
      type: 'shopping',
      channel: {
        name: 'storefront',
        source: process.env.NEXT_PUBLIC_SERVER_URL || 'https://showcase.emporix.io',
      },
      sessionValidated: true,
    };
    try {
      const cartId = await this.cartApi.createCart(createCartRequest);
      return cartId;
    } catch (error) {
      // only business error can be that it's a duplicate
      if (error instanceof Error && error.message.includes('Duplicate key found for a unique index.')) {
        const existingCart = await this.getCart();
        if (!existingCart) {
          throw new Error('Failed to get session cart');
        }
        return existingCart.id;
      }
      throw error;
    }
  }

  async getCart(): Promise<Cart | null> {
    const session = await this.sessionService.getCurrent();
    if (!session) {
      throw new Error('Failed to get session context');
    }
    const currentSiteCode = session.siteCode || 'main';
    let cart;

    // Try to get cart by cached ID (trusted - cartId is cleared on site change in setSite())
    if (session.cartId) {
      cart = await this.cartApi.getCart(session.cartId);

      // Site guard: skip cart from a different site (race condition in setSite)
      if (cart && cart.siteCode !== currentSiteCode) {
        this.logger.info(
          { cartId: session.cartId, cartSite: cart.siteCode, currentSite: currentSiteCode },
          'Skipping cart from different site — searching for current site cart',
        );
        cart = undefined;
      }

      // Safety check: if user is logged in but the cached cart is anonymous,
      // discard it and search for the customer's actual cart.
      // This happens when the anonymous→customer cart merge didn't complete during login
      // (e.g. B2B legalEntityId filtering prevented finding the anonymous cart).
      if (cart && session.customerId && !cart.customerId) {
        this.logger.info(
          { cartId: session.cartId, customerId: session.customerId },
          'Skipping stale anonymous cart for logged-in user — searching for customer cart',
        );
        cart = undefined;
      }
    }

    // Fallback to search by criteria if no valid cart found
    if (!cart) {
      // Search by session ID first (anonymous users), with create=true to auto-create if not found
      cart = await this.cartApi.getCartByCriteria(currentSiteCode, session.id, undefined, 'shopping', true);

      // If no cart found by session ID, try by customer ID (logged-in users)
      if (!cart && session.customerId) {
        cart = await this.cartApi.getCartByCriteria(currentSiteCode, undefined, session.customerId, 'shopping', true);
      }

      // Update session with correct cart ID if found/created
      if (cart) {
        await this.sessionService.setCart(cart.id);
      }
    }

    return cart ? this.mapper.mapToService(cart) : null;
  }

  async getCartById(id: string, checkSession = true): Promise<Cart | null> {
    const cart = await this.cartApi.getCart(id, checkSession);
    if (!cart) {
      return null;
    }
    return this.mapper.mapToService(cart);
  }

  async addItemToCart(cartId: string, productId: string, quantity: number): Promise<ModifyCartItemResult> {
    const [rawCart, product, session] = await Promise.all([
      this.cartApi.getCart(cartId),
      this.productService.getProductById(productId),
      this.sessionService.getCurrent(),
    ]);
    if (!rawCart) {
      throw new Error('Cart not found');
    }
    if (!session) {
      throw new Error('Failed to get session context');
    }
    if (!product) {
      throw new Error('Product missing');
    }

    // Determine the cart's effective site code
    const cartSiteCode = rawCart.siteCode || session.siteCode || 'main';

    // GUARD: If cart belongs to a different site, auto-recover by fetching/creating the correct cart.
    // This handles race conditions where the session site changed but the cart ID wasn't updated yet.
    if (cartSiteCode !== session.siteCode) {
      this.logger.warn(
        { cartId, cartSite: cartSiteCode, sessionSite: session.siteCode },
        'Cart belongs to different site — auto-recovering correct cart',
      );
      const correctCart = await this.getCart();
      if (!correctCart) {
        throw new Error('Failed to get cart for current site');
      }
      // Prevent infinite recursion: if we got back the same cart, something is fundamentally wrong
      if (correctCart.id === cartId) {
        throw new Error(
          `Cart site mismatch cannot be resolved: cart ${cartId} site=${cartSiteCode}, session site=${session.siteCode}`,
        );
      }
      return this.addItemToCart(correctCart.id, productId, quantity);
    }

    // Session and cart are aligned → matchPricesByContext handles currency conversion,
    // cross-site price fallback, and tax recalculation internally via the session context.
    const price = await this.priceService.getProductPrice(productId, quantity);

    // TODO find existing cartItem and merge if desired
    if (!price) {
      throw new Error('Price missing');
    }
    const { hasSufficientStock, availableQuantity } = await this.checkStock(cartSiteCode, productId, quantity);

    const addItemRequest: EmporixAddCartItemRequest = {
      siteCode: cartSiteCode,
      itemYrn: this.commonUtil.generateProductYrn(productId),
      quantity,
      product: {
        id: productId,
        name: l10n(product.name, session.language),
        description: l10n(product.description, session.language),
        sku: product.sku,
        images: product.images?.map((img: Media) => ({
          id: img.url,
          url: img.url,
        })),
      },
      price: {
        priceId: price.id,
        effectiveAmount: price.amount,
        originalAmount: price.originalAmount || price.amount,
        currency: price.currency,
      },
    };
    // Add item to cart regardless of stock availability
    // (we determine availability for information and handle the surplus asynchronously)
    const itemId = await this.cartApi.addItemToCart(cartId, addItemRequest);

    const cart = await this.getCartById(cartId);
    const cartItem = cart?.items.find((item) => item.id === itemId);
    if (!cartItem) {
      throw new Error('Cart item not found');
    }
    // Return result with appropriate status
    return {
      cartItem: cartItem,
      status: (hasSufficientStock ? 'OK' : 'PENDING') as CartStatus,
      statusDetailCode: (hasSufficientStock ? undefined : 'addToCart.insufficientStock') as CartStatusDetailCode,
      statusDetailPayload: { availableQuantity },
    };
  }

  private async checkStock(site: string, productId: string, quantity: number) {
    let hasSufficientStock = true;
    if (process.env.NEXT_CART_STOCK_CHECK_ENABLED === 'true') {
      // Check if we have sufficient stock
      const stockAvailability = await this.stockService.getStockAvailability(site, productId);
      hasSufficientStock = quantity <= stockAvailability.availableQuantity;
      return { hasSufficientStock, availableQuantity: stockAvailability?.availableQuantity || 0 };
    }
    return { hasSufficientStock: true, availableQuantity: -1 };
  }

  async updateCartItemQuantity(cartId: string, itemId: string, quantity: number): Promise<ModifyCartItemResult> {
    const cart = await this.getCartById(cartId);
    if (!cart) {
      throw new Error('Cart not found');
    }
    const cartItem = cart.items.find((item) => item.id === itemId);
    if (!cartItem || !cartItem.product?.id) {
      throw new Error('Cart item not found');
    }

    const cartSiteCode = cart.site || 'main';
    const session = await this.sessionService.getCurrent();

    // GUARD: Cart-session site alignment check.
    // Unlike addItemToCart, we don't auto-recover here because the user is interacting
    // with specific cart items — replacing the cart under them would be confusing.
    if (session && cartSiteCode !== session.siteCode) {
      this.logger.warn(
        { cartId, cartSite: cartSiteCode, sessionSite: session.siteCode },
        'Cart belongs to different site during quantity update — aborting',
      );
      throw new Error('Cart belongs to a different site. Please refresh the page.');
    }

    // Session-based pricing — matchPricesByContext handles currency/tax internally
    const price = await this.priceService.getProductPrice(cartItem.product.id, quantity);

    if (!price) {
      throw new Error('Price missing');
    }

    const updateRequest: EmporixUpdateCartItemRequest = {
      quantity,
      price: {
        effectiveAmount: price.amount,
        originalAmount: price.originalAmount || price.amount,
        currency: price.currency,
      },
    };

    const { hasSufficientStock, availableQuantity } = await this.checkStock(
      cart?.site || 'main',
      cartItem.product.id,
      quantity,
    );
    await this.cartApi.updateCartItemQuantity(cartId, itemId, updateRequest);

    // Update Item
    cartItem.quantity = quantity;
    cartItem.price.amount = updateRequest.price.effectiveAmount;
    cartItem.price.currency = updateRequest.price.currency;
    cartItem.price.originalAmount = updateRequest.price.originalAmount;

    return {
      cartItem: cartItem,
      status: (hasSufficientStock ? 'OK' : 'PENDING') as CartStatus,
      statusDetailCode: (hasSufficientStock ? undefined : 'addToCart.insufficientStock') as CartStatusDetailCode,
      statusDetailPayload: { availableQuantity },
    };
  }

  async removeCartItem(cartId: string, itemId: string): Promise<void> {
    await this.cartApi.removeCartItem(cartId, itemId);
  }

  async deleteCart(cartId: string): Promise<void> {
    await this.cartApi.deleteCart(cartId);
  }

  /**
   * Refresh a cart with automatic cleanup of orphaned legalEntityId.
   *
   * The Emporix refreshCart endpoint rejects anonymous carts that have a legalEntityId set
   * ("Anonymous cart cannot be assigned to a legal entity"). This can happen when a previous
   * bug caused legalEntityId to be spread onto anonymous carts via updateCart. The field is
   * stored on the backend but may NOT be returned by the GET /carts/{id} endpoint, so we
   * cannot detect it preemptively — instead we catch the specific error, clear the field,
   * and retry the refresh.
   */
  private async refreshCartWithCleanup(cartId: string): Promise<void> {
    try {
      await this.cartApi.refreshCart(cartId);
    } catch (error) {
      if (error instanceof Error && error.message.includes('Anonymous cart cannot be assigned to a legal entity')) {
        // This error occurs when refreshCart is called on an anonymous cart using a customer
        // session token whose context includes a legalEntityId (B2B customer).
        // The legalEntityId comes from the SESSION CONTEXT, not the cart field itself,
        // so clearing it on the cart object won't help. Check if the cart is actually
        // anonymous and the session is logged-in — if so, this is a mismatched-cart
        // situation that should be resolved by switching to the customer's own cart.
        const freshCart = await this.cartApi.getCart(cartId);
        const session = await this.sessionService.getCurrent();

        if (freshCart && !freshCart.customerId && session?.customerId) {
          // The cart is anonymous but the user is logged in — this cart shouldn't be
          // operated on with the customer session. Log and re-throw to let the caller
          // handle it (e.g. by fetching the correct customer cart).
          this.logger.warn(
            { cartId, customerId: session.customerId },
            'Cannot refresh anonymous cart with customer session (legalEntityId from session context) — cart/session mismatch',
          );
          throw error;
        }

        // Fallback: if the cart has a customerId but still hits this error, try the
        // original cleanup approach (clear orphaned legalEntityId on the cart itself)
        this.logger.warn({ cartId }, 'Detected orphaned legalEntityId on cart — clearing before retry');
        if (!freshCart) {
          throw error;
        }

        await this.cartApi.updateCart(cartId, {
          metadata: {
            ...freshCart.metadata,
            version: (freshCart.metadata?.version ?? 0) + 1,
          },
          legalEntityId: '',
        } as Partial<EmporixCart>);

        // Retry refresh after cleanup
        await this.cartApi.refreshCart(cartId);
      } else {
        throw error;
      }
    }
  }

  async updateShippingInfo(cartId: string, countryCode?: string, zipCode?: string): Promise<void> {
    // TODO Not used because of inconsistent Session/cart Handling
    // Get the session cart and update it
    const cart = await this.cartApi.getCart(cartId);
    if (!cart) {
      throw new Error('Cart not found');
    }
    await this.cartApi.updateCart(cartId, {
      metadata: {
        ...cart.metadata,
        version: (cart.metadata?.version ?? 0) + 1,
      },
      countryCode,
      zipCode,
    });
    await this.refreshCartWithCleanup(cartId);
  }

  async updateCurrency(cartId: string, currency: string): Promise<void> {
    const rawCart = await this.cartApi.getCart(cartId);
    if (!rawCart) {
      throw new Error('Cart not found');
    }
    const site = await this.siteService.getSite(rawCart.siteCode);
    if (!site) {
      throw new Error('Site not found');
    }

    if (!site.currencies.find((siteCurrency) => siteCurrency.code === currency || siteCurrency.id === currency)) {
      throw new Error('Currency not supported');
    }
    await this.cartApi.changeCurrency(cartId, currency);
    await this.refreshCartWithCleanup(cartId);
  }

  async updateSite(cartId: string, siteCode: string): Promise<void> {
    await this.cartApi.changeSite(cartId, siteCode);
    await this.refreshCartWithCleanup(cartId);
  }

  async getSavedCarts(pagination: PaginationQuery): Promise<Paginated<Cart>> {
    const session = await this.sessionService.getCurrent();
    if (!session?.customerId) {
      throw new Error('Saved Carts not available for Anonymous Sessions');
    }
    const carts = await this.cartApi.searchCarts({
      ...pagination,
      criteria: {
        customerId: session.customerId,
        type: '~shopping-',
      },
    });
    return {
      items: carts.items.map((cart) => this.mapper.mapToService(cart)),
      page: carts.page,
      pageSize: carts.size,
      total: carts.total,
    };
  }

  async saveCart(cartId: string, type: string = 'shopping'): Promise<void> {
    const session = await this.sessionService.getCurrent();
    if (!session?.customerId) {
      throw new Error('Saved Carts not available for Anonymous Sessions');
    }
    await this.cartApi.updateCart(cartId, {
      type: `${type}-${cartId}`,
    });
    this.sessionService.setCart(cartId);
  }

  async loadCart(cartId: string, type: string = 'shopping'): Promise<void> {
    const [cart, session] = await Promise.all([this.cartApi.getCart(cartId), this.sessionService.getCurrent()]);
    if (!session?.customerId) {
      throw new Error('Saved Carts not available for Anonymous Sessions');
    }
    if (!cart) {
      throw new Error('Cart not found');
    }
    if (session?.cartId) {
      // Save Current Cart before switching
      await this.saveCart(session.cartId, type);
    }
    this.cartApi.updateCart(cartId, {
      type: `${type}-${cartId}`,
    });
    // lazy update to prevent refetching
    this.sessionService.setCart(cartId);
  }

  /**
   * Get cart by criteria (siteCode, sessionId, customerId, type)
   * Useful for retrieving carts when you don't have the cart ID but have other identifiers
   *
   * @param siteCode - The site code to filter by
   * @param sessionId - The session ID to filter by
   * @param customerId - The customer ID to filter by
   * @param type - The cart type to filter by (e.g., 'shopping')
   * @returns The mapped cart or null if not found
   */
  async getCartByCriteria(
    siteCode: string,
    sessionId: string,
    customerId?: string,
    type: string = 'shopping',
  ): Promise<Cart | null> {
    try {
      const cart = await this.cartApi.getCartByCriteria(siteCode, sessionId, customerId, type);
      return cart ? this.mapper.mapToService(cart) : null;
    } catch (error) {
      this.logger.error({ err: error }, 'Error getting cart by criteria');
      return null;
    }
  }
}

export default EmporixCartService;
