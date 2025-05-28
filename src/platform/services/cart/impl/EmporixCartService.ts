import type { Cart } from "@/platform/services/model/cart/cart";
import type { CartService } from "@/platform/services/cart/CartService";
import type { CartApi } from "@/platform/integrations/emporix/cart/CartApi";
import { AddCartItemRequest, UpdateCartItemRequest } from "@/platform/integrations/emporix/model";
import { injectable } from "@/platform/core/di/injectable";
import { inject } from 'inversify';
import type { CartMapper } from "../../model/cart/CartMapper";
import type EmporixCommonUtil from "@/platform/integrations/emporix/common/util/EmporixCommonUtil";
import type { PriceService } from "@/platform/services/price/PriceService";
import type { ProductService } from "@/platform/services/product/ProductService";
import { Cart as EmporixCart, CartItem as EmporixCartItem } from '@/platform/integrations/emporix/model/cart';

/**
 * Implementation of CartService for Emporix cart data.
 * Maps between Emporix API cart format and internal Cart model.
 */
@injectable('CartService', "Singleton")
class EmporixCartService implements CartService {
  private commonUtil: EmporixCommonUtil;
  private cartApi: CartApi;
  private mapper: CartMapper<EmporixCart, EmporixCartItem>;
  private priceService: PriceService;
  private productService: ProductService;

  constructor(
    @inject('EmporixCommonUtil') commonUtil: EmporixCommonUtil,
    @inject('EmporixCartApi') cartApi: CartApi,
    @inject('EmporixCartMapper') mapper: CartMapper<EmporixCart, EmporixCartItem>,
    @inject('PriceService') priceService: PriceService,
    @inject('ProductService') productService: ProductService
  ) {
    this.commonUtil = commonUtil;
    this.cartApi = cartApi;
    this.mapper = mapper;
    this.priceService = priceService;
    this.productService = productService;
  }

  async createCart(currency: string, siteCode: string): Promise<string> {
    // TODO extract these information to a SiteConfigService
    const createCartRequest = {
      siteCode,
      currency,
      type: 'shopping',
      channel: {
        name: 'storefront',
        source: 'https://emporix-showcase.com/'
      },
      sessionValidated: true
    };

    return await this.cartApi.createCart(createCartRequest);
  }

  async getCartById(id: string): Promise<Cart | undefined> {
    const cart = await this.cartApi.getCart(id);
    return cart ? this.mapper.mapToService(cart) : undefined;
  }

  async addItemToCart(cartId: string, productId: string, quantity: number): Promise<string> {
    const cart = await this.getCartById(cartId);
    const product = await this.productService.getProductById(productId);
    if (!product) {
      throw new Error("Product missing");
    }
    // TODO find existing cartItem and merge if desired
    const price = await this.priceService.getProductPrice(productId, 'pc', quantity);
    if (!price) {
      throw new Error("Price missing");
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
        images: product.images?.map((img : string) => ({
          id: img,
          url: img
        }))
      },
      price: {
        priceId: price.id,
        effectiveAmount: price.effectiveValue,
        originalAmount: price.originalValue,
        currency: price.currency
      }
    };

    return await this.cartApi.addItemToCart(cartId, addItemRequest);
  }

  async updateCartItemQuantity(cartId: string, itemId: string, quantity: number): Promise<void> {
    const cart = await this.getCartById(cartId);
    const cartItem = cart?.items.find(item => item.id === itemId);
    if (!cartItem || !cartItem.product?.id) {
      throw new Error('Cart item not found');
    }
    const price = await this.priceService.getProductPrice(cartItem.product?.id, 'pc', quantity);
    if (!price) {
      throw new Error("Price missing");
    }
    const updateRequest: UpdateCartItemRequest = {
      quantity,
      price: {
        effectiveAmount: price.effectiveValue,
        originalAmount: price.originalValue,
        currency: price.currency
      }
    };

    await this.cartApi.updateCartItemQuantity(cartId, itemId, updateRequest);
  }

  async removeCartItem(cartId: string, itemId: string): Promise<void> {
    await this.cartApi.removeCartItem(cartId, itemId);
  }

  async deleteCart(cartId: string): Promise<void> {
    await this.cartApi.deleteCart(cartId);
  }
}


export default EmporixCartService;
