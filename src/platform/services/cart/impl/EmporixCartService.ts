import { inject } from 'inversify';
import { injectable } from '@/platform/core/di/injectable';
import type { CartApi } from '@/platform/integrations/emporix/cart/CartApi';
import type EmporixCommonUtil from '@/platform/integrations/emporix/common/util/EmporixCommonUtil';
import { AddCartItemRequest, UpdateCartItemRequest } from '@/platform/integrations/emporix/model';
import { EmporixCart, EmporixCartItem } from '@/platform/integrations/emporix/model/cart';
import type { CartService } from '@/platform/services/cart/CartService';
import type { Cart, CartItem } from '@/platform/services/model/cart/cart';
import type { PriceService } from '@/platform/services/price/PriceService';
import type { ProductService } from '@/platform/services/product/ProductService';
import type { SessionService } from '@/platform/services/session/SessionService';
import type { CartMapper } from '../../model/cart/CartMapper';
import { Media } from '../../model/common';

/**
 * Implementation of CartService for Emporix cart data.
 * Maps between Emporix API cart format and internal Cart model.
 */
@injectable('CartService', 'Singleton')
class EmporixCartService implements CartService {
  private commonUtil: EmporixCommonUtil;
  private cartApi: CartApi;
  private mapper: CartMapper<EmporixCart, EmporixCartItem>;
  private priceService: PriceService;
  private productService: ProductService;
  private sessionService: SessionService;

  constructor(
    @inject('EmporixCommonUtil') commonUtil: EmporixCommonUtil,
    @inject('EmporixCartApi') cartApi: CartApi,
    @inject('EmporixCartMapper') mapper: CartMapper<EmporixCart, EmporixCartItem>,
    @inject('SessionService') sessionService: SessionService,
    @inject('PriceService') priceService: PriceService,
    @inject('ProductService') productService: ProductService,
  ) {
    this.commonUtil = commonUtil;
    this.cartApi = cartApi;
    this.mapper = mapper;
    this.priceService = priceService;
    this.productService = productService;
    this.sessionService = sessionService;
  }

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
        const session = await this.sessionService.getCurrentSession();
        if (!session) {
          throw new Error('Failed to get session context');
        }
        const cart = await this.cartApi.getCartByCriteria(siteCode, session.id, undefined, 'shopping');
        if (!cart) {
          throw new Error('Failed to get session cart');
        }
        return cart.id;
      }
      throw error;
    }
  }

  async getCart(): Promise<Cart | null> {
    const session = await this.sessionService.getCurrentSession();
    if (!session) {
      throw new Error('Failed to get session context');
    }
    const cart = await this.cartApi.getCartByCriteria(session.siteCode || 'main', session.id, undefined, 'shopping');
    return cart ? this.mapper.mapToService(cart) : null;
  }

  async getCartById(id: string): Promise<Cart | null> {
    const cart = await this.cartApi.getCart(id);
    return cart ? this.mapper.mapToService(cart) : null;
  }

  async addItemToCart(cartId: string, productId: string, quantity: number): Promise<string> {
    const [product, price] = await Promise.all([
      this.productService.getProductById(productId),
      this.priceService.getProductPrice(productId, 'pc', quantity),
    ]);
    if (!product) {
      throw new Error('Product missing');
    }
    // TODO find existing cartItem and merge if desired
    if (!price) {
      throw new Error('Price missing');
    }
    const addItemRequest: AddCartItemRequest = {
      siteCode: 'main',
      itemYrn: this.commonUtil.generateProductYrn(productId),
      quantity,
      product: {
        id: productId,
        name: product.name,
        description: product.description,
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
    const price = await this.priceService.getProductPrice(cartItem.product?.id, 'pc', quantity);
    if (!price) {
      throw new Error('Price missing');
    }
    const updateRequest: UpdateCartItemRequest = {
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
    await this.cartApi.updateCart(cartId, {
      countryCode,
      zipCode,
    });
  }
}

export default EmporixCartService;
