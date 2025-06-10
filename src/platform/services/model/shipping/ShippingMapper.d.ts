import { EmporixMonetaryAmount } from '@/platform/integrations/emporix';
import { EmporixShippingMethod } from '@/platform/integrations/emporix/model/shipping';
import { ShippingMethod } from '.';

/**
 * Maps between Emporix shipping model and service shipping model
 */
export interface ShippingMapper {
  /**
   * Map from Emporix shipping method to service shipping method
   * @param emporixMethod The Emporix shipping method
   * @param zoneId The zone ID
   */
  mapToService(emporixMethod: EmporixShippingMethod, zoneId: string, cost?: EmporixMonetaryAmount): ShippingMethod;

  /**
   * Map from service shipping method to Emporix shipping method
   * @param serviceMethod The service shipping method
   */
  mapToEmporix(serviceMethod: ShippingMethod): EmporixShippingMethod;
}
