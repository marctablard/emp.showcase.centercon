import { EmporixMatchedPrice } from '@/platform/integrations/emporix/model/price';
import { Mapper } from '../Mapper';
import { ProductPrice } from '../price';

export interface PriceMapper extends Mapper<EmporixMatchedPrice, ProductPrice> {}
