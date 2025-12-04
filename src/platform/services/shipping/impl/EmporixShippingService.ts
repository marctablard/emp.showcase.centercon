import { inject } from 'inversify';
import { injectable } from '@/platform/core/di/injectable';
import { EmporixMonetaryAmount } from '@/platform/integrations/emporix/model/common';
import type { EmporixShippingApi } from '@/platform/integrations/emporix/shipping/EmporixShippingApi';
import { ShippingMethod } from '../../model/shipping';
import type { ShippingMapper } from '../../model/shipping/ShippingMapper';
import { ShippingService } from '../ShippingService';

/**
 * Implementation of ShippingService for Emporix shipping data
 */
@injectable('ShippingService', 'Singleton')
class EmporixShippingService implements ShippingService {
  private shippingApi: EmporixShippingApi;
  private shippingMapper: ShippingMapper;

  constructor(
    @inject('EmporixShippingApi') shippingApi: EmporixShippingApi,
    @inject('EmporixShippingMapper') shippingMapper: ShippingMapper,
  ) {
    this.shippingApi = shippingApi;
    this.shippingMapper = shippingMapper;
  }

  async getShippingMethods(
    country: string,
    postalCode: string,
    orderValue?: { amount: number; currency: string },
    siteId?: string,
  ): Promise<ShippingMethod[]> {
    try {
      siteId = siteId || process.env.NEXT_PUBLIC_DEFAULT_SITE;
      if (!siteId) {
        return [];
      }
      // Find site based on location
      const sites = await this.shippingApi.findSite({
        country,
        postalCode,
      });

      if (!sites || sites.length === 0) {
        return [];
      }

      // Get the first site
      const site = sites.find((site) => site.id === siteId);
      const methods: ShippingMethod[] = [];

      if (!site) {
        return [];
      }
      // Collect all shipping methods from all zones
      for (const zone of site.zones) {
        if (zone.methods && zone.methods.length > 0) {
          for (const method of zone.methods) {
            let cost: EmporixMonetaryAmount | undefined = undefined;
            if (orderValue) {
              const fee = method.fees
                .filter((fee) => fee.minOrderValue.currency == orderValue.currency)
                .filter((fee) => fee.minOrderValue.amount <= orderValue.amount)
                .sort((b, a) => a.minOrderValue.amount - b.minOrderValue.amount)
                .find((fee) => fee.cost.currency == orderValue.currency);
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

  async getShippingMethod(methodId: string, zoneId: string, siteId?: string): Promise<ShippingMethod | null> {
    try {
      siteId = siteId || process.env.NEXT_PUBLIC_DEFAULT_SITE;
      if (!siteId) {
        return null;
      }
      const emporixMethod = await this.shippingApi.getShippingMethod(siteId, zoneId, methodId);

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
