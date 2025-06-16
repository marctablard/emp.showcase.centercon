import { cache } from 'react';
import { Product } from '@/platform/services/model/product';
import { ProductService } from '@/platform/services/product';

const getProductService = () => globalThis.EMP.platform.ssr.get<ProductService>('ProductService');

const _getProduct = cache(async (id: string): Promise<Product | null | undefined> => {
  try {
    const product = await getProductService().getProductById(id);
    return product || null;
  } catch (_error) {
    return undefined;
  }
});

export function getProductById(id: string): Promise<Product | null | undefined> {
  return _getProduct(id);
}
