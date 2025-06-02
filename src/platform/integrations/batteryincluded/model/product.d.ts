import { Product as EmporixProduct } from '@/platform/integrations/emporix/model/product';
import { Media } from './common';

export interface BatteryIncludedProduct extends EmporixProduct {
  // We can basically re-use the Emporix-Model since the data-source for BatteryIncluded is Emporix
  medias?: Media[];
}
