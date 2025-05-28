import { Cart, Cart as ServiceCart, CartItem as ServiceCartItem } from '../cart';
import { Cart as EmporixCart, CartItem as EmporixCartItem } from '@/platform/integrations/emporix/model/cart';
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
    return {
      id: emporixCart.id,
      currency: emporixCart.currency,
      site: emporixCart.siteCode,
      legalEntity: emporixCart.legalEntityId,
      channel: emporixCart.channel?.name,
      items: emporixCart.items?.map(item => this.mapCartItemToService(item)) || [],
      totalPrice: emporixCart.totalPrice || { 
        amount: 0, 
        currency: emporixCart.currency 
      },
      subTotalPrice: emporixCart.subTotalPrice || { 
        amount: 0, 
        currency: emporixCart.currency 
      }
    };
  }

  /**
   * Maps an Emporix CartItem to a Service CartItem
   * @param emporixCartItem The Emporix CartItem to map
   * @returns A Service CartItem
   */
  mapCartItemToService(emporixCartItem: EmporixCartItem): ServiceCartItem {
    let tax : Tax | undefined;
    if (emporixCartItem.tax && emporixCartItem.price) {
      const amount = emporixCartItem.tax.grossValue - emporixCartItem.tax.netValue;
      tax = {
        amount,
        currency: emporixCartItem.price.currency ,
        netValue: emporixCartItem.tax.netValue,
        grossValue: emporixCartItem.tax.grossValue
      };
    } else {
      tax = undefined;
    }
    return {
      id: emporixCartItem.id,
      quantity: emporixCartItem.quantity,
      price: {
        amount: emporixCartItem.price?.effectiveAmount || 0,
        currency: emporixCartItem.price?.currency || '',
      },
      product: emporixCartItem.product ? {
        id: emporixCartItem.product.id,
        name: emporixCartItem.product.name,
        description: emporixCartItem.product.description,
        images: emporixCartItem.product.images?.map(img => { return { altText: emporixCartItem.product?.name || 'Product', url: img.url } })
      }: undefined,
      tax: tax
    };
  }

  mapToSource(cart: Cart): EmporixCart {
    throw new Error('Not implemented');
  }
}

export default EmporixCartMapper;