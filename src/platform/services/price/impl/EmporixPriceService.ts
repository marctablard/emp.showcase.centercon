import type { PriceService } from '../PriceService';
import type { Price, PriceMatchRequest, Quantity } from '../../model/price/price';
import type { PriceApi } from '@/platform/integrations/emporix/price/PriceApi';
import type { MatchPricesRequest, MatchPricesByContextRequest, PriceMatchItem, MatchedPrice } from '@/platform/integrations/emporix/model/price';
import { injectable } from '@/platform/core/di/injectable';
import { inject } from 'inversify';
import { PriceMapper } from '../../model/price/PriceMapper';
import type EmporixCommonUtil from '@/platform/integrations/emporix/common/util/EmporixCommonUtil';

/**
 * Implementation of PriceService for Emporix price data.
 * Maps between Emporix API price format and internal Price model.
 */
@injectable('PriceService', 'Singleton')
class EmporixPriceService implements PriceService {
  private priceApi: PriceApi;
  private mapper: PriceMapper;
  private commonUtil: EmporixCommonUtil;

  constructor(
    @inject('EmporixPriceApi') priceApi: PriceApi,
    @inject('EmporixPriceMapper') mapper: PriceMapper,
    @inject('EmporixCommonUtil') commonUtil: EmporixCommonUtil
  ) {
    this.priceApi = priceApi;
    this.mapper = mapper;
    this.commonUtil = commonUtil;
  }


  async getProductPrice(productId: string, unitCode: string, quantity: number, params?: { currency?: string; country?: string; siteCode?: string }): Promise<Price | null> {
    const items = [this.mapToMatchPriceItem(productId, unitCode, quantity)];
    let matchedPrices: MatchedPrice[];
    if (!params) {
      matchedPrices = await this.priceApi.matchPricesByContext({
        items
      })
    } else {
      const matchRequest: MatchPricesRequest = {
        targetCurrency: params.currency || 'EUR',
        siteCode: params.siteCode || 'main',
        targetLocation: {
          countryCode: params.country || 'DE'
        },
        items: [this.mapToMatchPriceItem(productId, unitCode, quantity)]
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
  private mapToMatchPriceItem(productId: string, unitCode: string, quantity: number): PriceMatchItem {
    return {
      itemId: {
        itemType: 'PRODUCT',
        id: productId
      },
      quantity: this.mapper.mapQuantityToEmporix({ quantity, unitCode })
    };
  }
}

export default EmporixPriceService;
