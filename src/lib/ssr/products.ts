import { cache } from 'react';
import { Product } from '@/platform/services/model/product';
import { ProductFetchOptions, ProductService } from '@/platform/services/product';
import { StockService } from '@/platform/services/stock/StockService';
import { StockAvailability } from '@/platform/services/stock/StockService';
import ssr from '@/platform/ssr';

const getProductService = () => ssr.get<ProductService>('ProductService');
const getStockService = () => ssr.get<StockService>('StockService');

// "options" need to be a String, otherwise the cache will not work
// (every object instance is considered a different parameter, regardless of its contents)
const _getProduct = cache(async (id: string, optionsJson: string): Promise<Product | null | undefined> => {
  try {
    const options: ProductFetchOptions | undefined = optionsJson ? JSON.parse(optionsJson) : undefined;
    const product = await getProductService().getProductById(id, options);
    return product || null;
  } catch (_error) {
    console.error(_error);
    return undefined;
  }
});

const _getAvailability = cache(async (site: string, id: string): Promise<StockAvailability | null | undefined> => {
  try {
    const availability = await getStockService().getStockAvailability(site, id);
    return availability || null;
  } catch (_error) {
    return undefined;
  }
});

export function getAvailability(site: string, id: string): Promise<StockAvailability | null | undefined> {
  return _getAvailability(site, id);
}

export function getProductById(id: string, options?: ProductFetchOptions): Promise<Product | null | undefined> {
  const optionsJson = options ? JSON.stringify(options) : '';
  return _getProduct(id, optionsJson);
}
