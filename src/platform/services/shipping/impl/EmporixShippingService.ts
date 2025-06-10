import { inject } from 'inversify';
import { injectable } from '@/platform/core/di/injectable';
import { EmporixMonetaryAmount } from '@/platform/integrations/emporix';
import type { ShippingApi } from '@/platform/integrations/emporix/shipping/ShippingApi';
import { ShippingMethod } from '../../model/shipping';
import type { ShippingMapper } from '../../model/shipping/ShippingMapper';
import { ShippingService } from '../ShippingService';

/**
 * Implementation of ShippingService for Emporix shipping data
 */
@injectable('ShippingService', 'Singleton')
class EmporixShippingService implements ShippingService {
  private shippingApi: ShippingApi;
  private shippingMapper: ShippingMapper;

  // Default site ID - in a real application, this might be configurable
  private defaultSiteId = 'main';

  constructor(
    @inject('EmporixShippingApi') shippingApi: ShippingApi,
    @inject('EmporixShippingMapper') shippingMapper: ShippingMapper,
  ) {
    this.shippingApi = shippingApi;
    this.shippingMapper = shippingMapper;
  }

  async getShippingMethods(
    country: string,
    postalCode: string,
    orderValue?: { amount: number; currency: string },
  ): Promise<ShippingMethod[]> {
    try {
      // Find site based on location
      const sites = await this.shippingApi.findSite({
        country,
        postalCode,
      });

      if (!sites || sites.length === 0) {
        return [];
      }

      // Get the first site
      const site = sites[0];
      const methods: ShippingMethod[] = [];

      // Collect all shipping methods from all zones
      for (const zone of site.zones) {
        if (zone.methods && zone.methods.length > 0) {
          for (const method of zone.methods) {
            let cost: EmporixMonetaryAmount | undefined = undefined;
            if (orderValue) {
              const fee = method.fees
                .filter((fee) => fee.minOrderValue.currency == orderValue.currency)
                .filter((fee) => fee.minOrderValue.amount <= orderValue.amount)
                .sort((a, b) => b.minOrderValue.amount - a.minOrderValue.amount)
                .findLast((fee) => fee.cost.currency == orderValue.currency);
              if (fee) {
                cost = fee.cost;
              }
            }
            methods.push(this.shippingMapper.mapToService(method, zone.id, cost));
          }
        }
      }

      return methods;
    } catch (error) {
      console.error('Error getting shipping methods:', error);
      return [];
    }
  }

  async getShippingMethod(methodId: string, zoneId: string): Promise<ShippingMethod | null> {
    try {
      const emporixMethod = await this.shippingApi.getShippingMethod(this.defaultSiteId, zoneId, methodId);

      if (!emporixMethod) {
        return null;
      }

      return this.shippingMapper.mapToService(emporixMethod, zoneId);
    } catch (error) {
      console.error('Error getting shipping method:', error);
      return null;
    }
  }
}

export default EmporixShippingService;
