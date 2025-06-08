import { inject } from 'inversify';
import { injectable } from '@/platform/core/di/injectable';
import type { MatchPricesRequest, MatchedPrice, PriceMatchItem } from '@/platform/integrations/emporix/model/price';
import type { PriceApi } from '@/platform/integrations/emporix/price/PriceApi';
import PriceMapper from '@/platform/services/model/price/PriceMapper';
import type { ProductPrice } from '../../model/price/price';
import type { PriceService } from '../PriceService';

/**
 * Implementation of PriceService for Emporix price data.
 * Maps between Emporix API price format and internal Price model.
 */
@injectable('PriceService', 'Singleton')
class EmporixPriceService implements PriceService {
  private priceApi: PriceApi;
  private mapper: PriceMapper;

  constructor(@inject('EmporixPriceApi') priceApi: PriceApi, @inject('EmporixPriceMapper') mapper: PriceMapper) {
    this.priceApi = priceApi;
    this.mapper = mapper;
  }

  async getProductPrice(
    productId: string,
    unitCode?: string,
    quantity: number = 1,
    params?: { currency?: string; country?: string; siteCode?: string },
  ): Promise<ProductPrice | null> {
    const items = [this.mapToMatchPriceItem(productId, unitCode, quantity)];
    let matchedPrices: MatchedPrice[];
    if (!params) {
      matchedPrices = await this.priceApi.matchPricesByContext({
        items,
      });
    } else {
      const matchRequest: MatchPricesRequest = {
        targetCurrency: params.currency || 'EUR',
        siteCode: params.siteCode || 'main',
        targetLocation: {
          countryCode: params.country || 'DE',
        },
        items: [this.mapToMatchPriceItem(productId, unitCode, quantity)],
      };
      matchedPrices = await this.priceApi.matchPrices(matchRequest);
    }
    return matchedPrices.length > 0 ? this.mapper.mapToService(matchedPrices[0]) : null;
  }

  /**
   * Maps a product ID and quantity to a PriceMatchItem
   * @param productId The product ID
   * @param unitCode The unit code
   * @param quantity The quantity information
   * @returns A PriceMatchItem
   */
  private mapToMatchPriceItem(productId: string, unitCode?: string, quantity: number = 1): PriceMatchItem {
    return {
      itemId: {
        itemType: 'PRODUCT',
        id: productId,
      },
      quantity: this.mapper.mapQuantityToEmporix({ quantity, unitCode }),
    };
  }
}

export default EmporixPriceService;
