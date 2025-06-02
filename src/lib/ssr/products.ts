import { cache } from 'react';
import { Product } from '@/platform/services/model/product';
import { ProductService } from '@/platform/services/product';

const getProductService = () => globalThis.EMP.platform.ssr.get<ProductService>('ProductService');

const _getProduct = cache(async (id: string): Promise<Product | null> => {
  const product = await getProductService().getProductById(id);
  return product || null;
});

export function getProductById(id: string): Promise<Product | null> {
  return _getProduct(id);
}
