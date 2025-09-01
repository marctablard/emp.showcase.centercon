import { inject } from 'inversify';
import { l10n } from '@/lib/utils';
import { injectable } from '@/platform/core/di/injectable';
import type { EmporixCartApi } from '@/platform/integrations/emporix/cart/EmporixCartApi';
import type EmporixCommonUtil from '@/platform/integrations/emporix/common/util/EmporixCommonUtil';
import { EmporixAddCartItemRequest, EmporixUpdateCartItemRequest } from '@/platform/integrations/emporix/model';
import { EmporixCart, EmporixCartItem } from '@/platform/integrations/emporix/model/cart';
import type { EmporixSessionContextApi } from '@/platform/integrations/emporix/session/EmporixSessionContextApi';
import type { CartService } from '@/platform/services/cart/CartService';
import type { Cart, CartItem } from '@/platform/services/model/cart/cart';
import type { PriceService } from '@/platform/services/price/PriceService';
import type { ProductService } from '@/platform/services/product/ProductService';
import type { CartMapper } from '../../model/cart/CartMapper';
import { Media } from '../../model/common';

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
    @inject('EmporixSessionContextApi') private sessionContextApi: EmporixSessionContextApi,
    @inject('PriceService') private priceService: PriceService,
    @inject('ProductService') private productService: ProductService,
  ) {}

  async createCart(currency: string, siteCode: string): Promise<string> {
    // TODO extract these information to a SiteConfigService
    const createCartRequest = {
      siteCode,
      currency,
      type: 'shopping',
      channel: {
        name: 'storefront',
        source: 'https://emporix-showcase.com/',
      },
      sessionValidated: true,
    };
    try {
      const cartId = await this.cartApi.createCart(createCartRequest);
      return cartId;
    } catch (error) {
      // only error can be that it's a duplicate
      if (error instanceof Error && error.message.includes('Duplicate key found for a unique index.')) {
        const session = await this.sessionContextApi.getOwnSessionContext();
        if (!session) {
          throw new Error('Failed to get session context');
        }
        const cart = await this.cartApi.getCartByCriteria(siteCode, session.sessionId, undefined, 'shopping');
        if (!cart) {
          throw new Error('Failed to get session cart');
        }
        return cart.id;
      }
      throw error;
    }
  }

  // TODO Not used because of inconsistent Session/cart Handling
  async getCart(): Promise<Cart | null> {
    const session = await this.sessionContextApi.getOwnSessionContext();
    if (!session) {
      throw new Error('Failed to get session context');
    }
    const cart = await this.cartApi.getCartByCriteria(
      session.siteCode || 'main',
      session.sessionId,
      undefined,
      'shopping',
    );
    return cart ? this.mapper.mapToService(cart) : null;
  }

  async getCartById(id: string): Promise<Cart | null> {
    const session = await this.sessionContextApi.getOwnSessionContext();
    if (!session) {
      throw new Error('Failed to get session context');
    }
    const cart = await this.cartApi.getCart(id);
    if (!cart) {
      return null;
    }
    if (session.customerId == 'ANONYMOUS') {
      if (cart.customerId || cart.sessionId != session.sessionId) {
        throw new Error('Cart does not belong to this session');
      }
    } else if (cart.customerId != session.customerId) {
      throw new Error('Cart does not belong to this customer');
    }
    return this.mapper.mapToService(cart);
  }

  async addItemToCart(cartId: string, productId: string, quantity: number): Promise<string> {
    const [product, price, session] = await Promise.all([
      this.productService.getProductById(productId),
      this.priceService.getProductPrice(productId, quantity),
      this.sessionContextApi.getOwnSessionContext(),
    ]);
    if (!product) {
      throw new Error('Product missing');
    }
    // TODO find existing cartItem and merge if desired
    if (!price) {
      throw new Error('Price missing');
    }

    const addItemRequest: EmporixAddCartItemRequest = {
      siteCode: session.siteCode || 'main',
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
        effectiveAmount: price.effectiveValue,
        originalAmount: price.originalValue || price.effectiveValue,
        currency: price.currency,
      },
    };

    return await this.cartApi.addItemToCart(cartId, addItemRequest);
  }

  async updateCartItemQuantity(cartId: string, itemId: string, quantity: number): Promise<CartItem> {
    const cart = await this.getCartById(cartId);
    const cartItem = cart?.items.find((item) => item.id === itemId);
    if (!cartItem || !cartItem.product?.id) {
      throw new Error('Cart item not found');
    }
    const price = await this.priceService.getProductPrice(cartItem.product?.id, quantity);
    if (!price) {
      throw new Error('Price missing');
    }
    const updateRequest: EmporixUpdateCartItemRequest = {
      quantity,
      price: {
        effectiveAmount: price.effectiveValue,
        originalAmount: price.originalValue || price.effectiveValue,
        currency: price.currency,
      },
    };

    await this.cartApi.updateCartItemQuantity(cartId, itemId, updateRequest);
    // update Item
    cartItem.quantity = quantity;
    cartItem.price.amount = updateRequest.price.effectiveAmount;
    cartItem.price.currency = updateRequest.price.currency;
    cartItem.price.originalAmount = updateRequest.price.originalAmount;
    return cartItem;
  }

  async removeCartItem(cartId: string, itemId: string): Promise<void> {
    await this.cartApi.removeCartItem(cartId, itemId);
  }

  async deleteCart(cartId: string): Promise<void> {
    await this.cartApi.deleteCart(cartId);
  }

  async updateShippingInfo(cartId: string, countryCode?: string, zipCode?: string): Promise<void> {
    // TODO Not used because of inconsistent Session/cart Handling
    // Get the session cart and update it
    const cart = await this.cartApi.getCart(cartId);
    if (!cart) {
      throw new Error('Cart not found');
    }
    await this.cartApi.updateCart(cartId, {
      ...cart,
      metadata: {
        ...cart.metadata,
        version: (cart.metadata?.version ?? 0) + 1,
      },
      countryCode,
      zipCode,
    });
    await this.cartApi.refreshCart(cartId);
  }

  async updateCurrency(cartId: string, currency: string): Promise<void> {
    await this.cartApi.changeCurrency(cartId, currency);
    await this.cartApi.refreshCart(cartId);
  }

  async updateSite(cartId: string, siteCode: string): Promise<void> {
    await this.cartApi.changeSite(cartId, siteCode);
    await this.cartApi.refreshCart(cartId);
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
      console.error('Error getting cart by criteria:', error);
      return null;
    }
  }
}

export default EmporixCartService;
