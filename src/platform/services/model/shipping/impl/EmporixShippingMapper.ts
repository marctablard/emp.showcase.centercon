import { injectable } from '@/platform/core/di/injectable';
import { ShippingMethod } from '..';
import { EmporixShippingMethod } from '@/platform/integrations/emporix/model/shipping';
import { ShippingMapper } from '../ShippingMapper';

/**
 * Implementation of ShippingMapper for Emporix shipping data
 */
@injectable('EmporixShippingMapper', 'Singleton')
class EmporixShippingMapper implements ShippingMapper {
  /**
   * Map from Emporix shipping method to service shipping method
   * @param emporixMethod The Emporix shipping method
   * @param zoneId The zone ID
   */
  mapToService(emporixMethod: EmporixShippingMethod, zoneId: string): ShippingMethod {
    return {
      id: emporixMethod.id,
      name: emporixMethod.name.en || Object.values(emporixMethod.name)[0] || emporixMethod.id,
      description: '',
      cost: emporixMethod.cost?.value || 0,
      currency: emporixMethod.cost?.currency || 'USD',
      zoneId: zoneId,
    };
  }

  /**
   * Map from service shipping method to Emporix shipping method
   * @param serviceMethod The service shipping method
   */
  mapToEmporix(serviceMethod: ShippingMethod): EmporixShippingMethod {
    return {
      id: serviceMethod.id,
      name: { en: serviceMethod.name },
      cost: {
        value: serviceMethod.cost,
        currency: serviceMethod.currency,
      },
    };
  }
}

export default EmporixShippingMapper;
