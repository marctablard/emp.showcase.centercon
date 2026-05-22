'use client';

import type { Product } from '@/platform/services/model/product';
import { useComparisonStore } from '@/providers/StoreProvider';
import { MAX_COMPARISON_PRODUCTS } from '@/stores/comparison-store';

interface UseComparisonResult {
  products: Product[];
  count: number;
  addProduct: (product: Product) => boolean;
  removeProduct: (productId: string) => void;
  toggleProduct: (product: Product) => void;
  isInComparison: (productId: string) => boolean;
  clearComparison: () => void;
  isFull: boolean;
}

export const useComparison = (): UseComparisonResult => {
  const store = useComparisonStore();

  const toggleProduct = (product: Product): void => {
    if (store.isInComparison(product.id)) {
      store.removeProduct(product.id);
    } else {
      store.addProduct(product);
    }
  };

  return {
    products: store.products,
    count: store.getCount(),
    addProduct: store.addProduct,
    removeProduct: store.removeProduct,
    toggleProduct,
    isInComparison: store.isInComparison,
    clearComparison: store.clearComparison,
    isFull: store.products.length >= MAX_COMPARISON_PRODUCTS,
  };
};

export default useComparison;
