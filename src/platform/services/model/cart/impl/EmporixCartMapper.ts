import { Cart, Cart as ServiceCart, CartItem as ServiceCartItem } from '../cart';
import {
  EmporixCart as EmporixCart,
  EmporixCartItem as EmporixCartItem,
} from '@/platform/integrations/emporix/model/cart';
import { injectable } from '@/platform/core/di/injectable';
import { Tax } from '../../common';
import { CartMapper } from '../CartMapper';

/**
 * Maps between Emporix Cart model and Service Cart model
 */
@injectable('EmporixCartMapper', 'Singleton')
export class EmporixCartMapper implements CartMapper<EmporixCart, EmporixCartItem> {
  /**
   * Maps an Emporix Cart to a Service Cart
   * @param emporixCart The Emporix Cart to map
   * @returns A Service Cart
   */
  mapToService(emporixCart: EmporixCart): ServiceCart {
    let totalPrice;
    if (emporixCart.calculatedPrice?.finalPrice) {
      totalPrice = {
        amount: emporixCart.calculatedPrice.finalPrice.grossValue,
        currency: emporixCart.currency,
      };
    } else {
      totalPrice = {
        amount: 0,
        currency: emporixCart.currency,
      };
    }
    let subTotalPrice;
    if (emporixCart.calculatedPrice?.price) {
      subTotalPrice = {
        amount: emporixCart.calculatedPrice.price.grossValue,
        currency: emporixCart.currency,
      };
    } else {
      subTotalPrice = {
        amount: 0,
        currency: emporixCart.currency,
      };
    }
    let tax;
    if (emporixCart.calculatedPrice?.price) {
      tax = {
        amount: emporixCart.calculatedPrice.price.taxValue,
        currency: emporixCart.currency,
        netValue: emporixCart.calculatedPrice.price.netValue,
        grossValue: emporixCart.calculatedPrice.price.grossValue,
      };
    } else {
      tax = {
        amount: 0,
        currency: emporixCart.currency,
        netValue: 0,
        grossValue: 0,
      };
    }
    return {
      id: emporixCart.id,
      currency: emporixCart.currency,
      site: emporixCart.siteCode,
      legalEntity: emporixCart.legalEntityId,
      channel: emporixCart.channel?.name,
      items: emporixCart.items?.map((item) => this.mapCartItemToService(emporixCart, item)) || [],
      totalPrice: totalPrice,
      subTotalPrice: subTotalPrice,
      tax: tax,
    };
  }

  /**
   * Maps an Emporix CartItem to a Service CartItem
   * @param emporixCartItem The Emporix CartItem to map
   * @returns A Service CartItem
   */
  mapCartItemToService(emporixCart: EmporixCart, emporixCartItem: EmporixCartItem): ServiceCartItem {
    let tax: Tax | undefined;
    if (emporixCartItem.calculatedPrice?.finalPrice) {
      const amount = emporixCartItem.calculatedPrice.finalPrice.taxValue;
      tax = {
        amount: amount,
        currency: emporixCart.currency,
        netValue: emporixCartItem.calculatedPrice.finalPrice.netValue,
        grossValue: emporixCartItem.calculatedPrice.finalPrice.grossValue,
      };
    } else {
      tax = undefined;
    }
    return {
      id: emporixCartItem.id,
      quantity: emporixCartItem.quantity,
      price: {
        amount: emporixCartItem.calculatedPrice?.finalPrice.grossValue || 0,
        currency: emporixCart.currency,
      },
      product: emporixCartItem.product
        ? {
            id: emporixCartItem.product.id,
            name: emporixCartItem.product.name,
            description: emporixCartItem.product.description,
            images: emporixCartItem.product.images?.map((img) => {
              return { altText: emporixCartItem.product?.name || 'Product', url: img.url };
            }),
          }
        : undefined,
      tax: tax,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  mapToSource(cart: Cart): EmporixCart {
    throw new Error('Not implemented');
  }
}

export default EmporixCartMapper;
