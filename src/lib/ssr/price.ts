import { cache } from 'react';
import { ProductPrice } from '@/platform/services/model/price/price';
import { PriceService } from '@/platform/services/price';

const getPriceService = () => globalThis.EMP.platform.ssr.get<PriceService>('PriceService');

const _getPrice = cache(async (id: string, unitCode?: string, quantity?: number): Promise<ProductPrice | null> => {
  const price = await getPriceService().getProductPrice(id, unitCode, quantity);
  return price;
});

export function getProductPrice(id: string, unitCode?: string, quantity?: number): Promise<ProductPrice | null> {
  return _getPrice(id, unitCode, quantity);
}
