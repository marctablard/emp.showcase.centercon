import { EmporixShipping } from '../../integrations/emporix/model';
import { Mapper } from '../Mapper';
import { CheckoutRequest } from '../checkout';
import { OrderShipping } from '../checkout';

export interface CheckoutMapper<SOURCE> extends Mapper<SOURCE, CheckoutRequest> {
  mapShippingToSource(service: OrderShipping): EmporixShipping;

  mapShippingFromSource(source: EmporixShipping): OrderShipping;
}
