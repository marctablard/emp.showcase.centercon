import { inject } from 'inversify';
import { injectable } from '@/platform/core/di/injectable';
import { EmporixShippingMethod } from '@/platform/integrations/emporix/model/shipping';
import type { ShippingApi } from '@/platform/integrations/emporix/shipping/ShippingApi';
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

  async getShippingMethods(countryCode: string, postalCode: string): Promise<EmporixShippingMethod[]> {
    try {
      // Find site based on location
      const sites = await this.shippingApi.findSite({
        countryCode,
        postalCode,
      });

      if (!sites || sites.length === 0) {
        return [];
      }

      // Get the first site
      const site = sites[0];
      const methods: EmporixShippingMethod[] = [];

      // Collect all shipping methods from all zones
      for (const zone of site.zones) {
        if (zone.methods && zone.methods.length > 0) {
          for (const method of zone.methods) {
            methods.push(this.shippingMapper.mapToService(method, zone.id));
          }
        }
      }

      return methods;
    } catch (error) {
      console.error('Error getting shipping methods:', error);
      return [];
    }
  }

  async getShippingMethod(methodId: string, zoneId: string): Promise<EmporixShippingMethod | undefined> {
    try {
      const emporixMethod = await this.shippingApi.getShippingMethod(this.defaultSiteId, zoneId, methodId);

      if (!emporixMethod) {
        return undefined;
      }

      return this.shippingMapper.mapToService(emporixMethod, zoneId);
    } catch (error) {
      console.error('Error getting shipping method:', error);
      return undefined;
    }
  }
}

export default EmporixShippingService;
