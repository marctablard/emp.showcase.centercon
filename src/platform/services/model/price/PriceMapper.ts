import { injectable } from '@/platform/core/di/injectable';
import { Quantity as EmporixQuantity, MatchedPrice } from '@/platform/integrations/emporix/model/price';
import { Quantity, ProductPrice as ServicePrice, Quantity as ServiceQuantity } from './price';

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
    const tierDefinitions: Record<string, { id: string; minQuantity: Quantity }> = {};
    emporixPrice.priceModel.tierDefinition.tiers.forEach((tierDef) => {
      tierDefinitions[tierDef.id] = { id: tierDef.id, minQuantity: tierDef.minQuantity };
    });
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
      tierValues: emporixPrice.tierValues.map((tier) => ({
        id: tier.id,
        minQuantity: tierDefinitions[tier.id].minQuantity.quantity,
        unit: tierDefinitions[tier.id].minQuantity.unitCode,
        price: tier.priceValue,
      })),
    };
  }

  /**
   * Maps an Emporix Quantity to a Service Quantity
   * @param emporixQuantity The Emporix Quantity to map
   * @returns A Service Quantity
   */
  mapQuantityToService(emporixQuantity: EmporixQuantity): ServiceQuantity {
    const result: ServiceQuantity = {
      quantity: emporixQuantity.quantity,
    };

    if (emporixQuantity.unitCode) {
      result.unitCode = emporixQuantity.unitCode;
    }

    return result;
  }

  /**
   * Maps a Service Quantity to an Emporix Quantity
   * @param serviceQuantity The Service Quantity to map
   * @returns An Emporix Quantity
   */
  mapQuantityToEmporix(serviceQuantity: ServiceQuantity): EmporixQuantity {
    const result: EmporixQuantity = {
      quantity: serviceQuantity.quantity,
    };

    if (serviceQuantity.unitCode) {
      result.unitCode = serviceQuantity.unitCode;
    }

    return result;
  }
}

export default PriceMapper;
