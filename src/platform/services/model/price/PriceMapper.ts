import { Price as ServicePrice, Quantity as ServiceQuantity } from './price';
import { MatchedPrice, Quantity as EmporixQuantity } from '@/platform/integrations/emporix/model/price';
import { injectable } from '@/platform/core/di/injectable';

/**
 * Maps between Emporix Price model and Service Price model
 */
@injectable('EmporixPriceMapper', 'Singleton')
export class PriceMapper {
  /**
   * Maps an Emporix MatchedPrice to a Service Price
   * @param emporixPrice The Emporix MatchedPrice to map
   * @returns A Service Price
   */
  mapToService(emporixPrice: MatchedPrice): ServicePrice {
    return {
      id: emporixPrice.priceId,
      productId: emporixPrice.itemId.id,
      currency: emporixPrice.currency,
      originalValue: emporixPrice.originalValue,
      effectiveValue: emporixPrice.effectiveValue,
      totalValue: emporixPrice.totalValue,
      quantity: this.mapQuantityToService(emporixPrice.quantity),
      includesTax: emporixPrice.includesTax,
      tax: emporixPrice.tax
        ? {
            taxClass: emporixPrice.tax.taxClass,
            taxRate: emporixPrice.tax.taxRate,
            netValue: emporixPrice.tax.prices.effectiveValue.netValue,
            grossValue: emporixPrice.tax.prices.effectiveValue.grossValue,
            taxValue: emporixPrice.tax.prices.effectiveValue.taxValue,
          }
        : undefined,
    };
  }

  /**
   * Maps an Emporix Quantity to a Service Quantity
   * @param emporixQuantity The Emporix Quantity to map
   * @returns A Service Quantity
   */
  mapQuantityToService(emporixQuantity: EmporixQuantity): ServiceQuantity {
    return {
      quantity: emporixQuantity.quantity,
      unitCode: emporixQuantity.unitCode,
    };
  }

  /**
   * Maps a Service Quantity to an Emporix Quantity
   * @param serviceQuantity The Service Quantity to map
   * @returns An Emporix Quantity
   */
  mapQuantityToEmporix(serviceQuantity: ServiceQuantity): EmporixQuantity {
    return {
      quantity: serviceQuantity.quantity,
      unitCode: serviceQuantity.unitCode,
    };
  }
}

export default PriceMapper;
