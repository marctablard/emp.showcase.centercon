import { inject } from 'inversify';
import { injectable } from '@/platform/core/di/injectable';
import type {
  EmporixMatchPricesRequest,
  EmporixMatchedPrice,
  EmporixPriceMatchItem,
} from '@/platform/integrations/emporix/model/price';
import type { EmporixPriceApi } from '@/platform/integrations/emporix/price/EmporixPriceApi';
import type { ProductPrice } from '@/platform/services/model/price';
import type PriceMapper from '@/platform/services/model/price/impl/EmporixPriceMapper';
import type { SiteService } from '../../site/SiteService';
import type { PriceFetchOptions, PriceService } from '../PriceService';

/**
 * Implementation of PriceService for Emporix price data.
 * Maps between Emporix API price format and internal Price model.
 */
@injectable('PriceService', 'Singleton')
class EmporixPriceService implements PriceService {
  constructor(
    @inject('EmporixPriceApi') private priceApi: EmporixPriceApi,
    @inject('EmporixPriceMapper') private mapper: PriceMapper,
    @inject('SiteService') private siteService: SiteService,
  ) {}

  async getProductPrice(
    productId: string,
    quantity: number = 1,
    unitCode?: string,
    params?: PriceFetchOptions,
  ): Promise<ProductPrice | null> {
    const items = [this.mapToMatchPriceItem(productId, quantity, unitCode)];
    let matchedPrices: EmporixMatchedPrice[];
    if (!params) {
      matchedPrices = await this.priceApi.matchPricesByContext({
        items,
      });
    } else {
      if (!params.currency || !params.country) {
        const site = await this.siteService.getSite(params.siteCode);
        if (!site) {
          throw new Error(`Site ${params.siteCode} not found`);
        }
        params.currency = site.defaultCurrency.id;
        params.country = site.defaultCountry;
      }
      const matchRequest: EmporixMatchPricesRequest = {
        targetCurrency: params.currency!,
        siteCode: params.siteCode,
        targetLocation: {
          countryCode: params.country!,
        },
        items: [this.mapToMatchPriceItem(productId, quantity, unitCode)],
        useFallback: true, //TODO: confirm if it should be true by default, or if it should be configurable via account settings, endpoint or ENVs
      };
      matchedPrices = await this.priceApi.matchPrices(matchRequest);
    }
    const price = matchedPrices.length > 0 ? this.mapper.mapToService(matchedPrices[0]) : null;
    // TODO clarify, what to do when more prices match?
    return price;
  }

  /**
   * Maps a product ID and quantity to a PriceMatchItem
   * @param productId The product ID
   * @param quantity The quantity information
   * @param unitCode The unit code
   * @returns A PriceMatchItem
   */
  private mapToMatchPriceItem(productId: string, quantity: number, unitCode?: string): EmporixPriceMatchItem {
    const matchPrice: EmporixPriceMatchItem = {
      itemId: {
        itemType: 'PRODUCT',
        id: productId,
      },
      quantity: {
        quantity,
      },
    };
    if (unitCode) {
      matchPrice.quantity.unitCode = unitCode;
    }
    return matchPrice;
  }
}

export default EmporixPriceService;
