import { inject } from 'inversify';
import { injectable } from '@/platform/core/di/injectable';
import type {
  EmporixMatchPricesRequest,
  EmporixMatchedPrice,
  EmporixPriceMatchItem,
} from '@/platform/integrations/emporix/model/price';
import type { PriceApi } from '@/platform/integrations/emporix/price/PriceApi';
import type PriceMapper from '@/platform/services/model/price/impl/EmporixPriceMapper';
import type { ProductPrice } from '../../model/price';
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
    const items = [this.mapToMatchPriceItem(productId, quantity, unitCode)];
    let matchedPrices: EmporixMatchedPrice[];
    if (!params) {
      matchedPrices = await this.priceApi.matchPricesByContext({
        items,
      });
    } else {
      const matchRequest: EmporixMatchPricesRequest = {
        targetCurrency: params.currency || 'EUR',
        siteCode: params.siteCode || 'main',
        targetLocation: {
          countryCode: params.country || 'DE',
        },
        items: [this.mapToMatchPriceItem(productId, quantity, unitCode)],
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
  private mapToMatchPriceItem(productId: string, quantity: number, unitCode?: string): EmporixPriceMatchItem {
    return {
      itemId: {
        itemType: 'PRODUCT',
        id: productId,
      },
      quantity: {
        quantity,
        unitCode,
      },
    };
  }
}

export default EmporixPriceService;
