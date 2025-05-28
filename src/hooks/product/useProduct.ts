'use client'

import { useProductStore } from '@/providers/StoreProvider';
import { Product } from '@/platform/services/model/product';
import { useCallback, useEffect, useState } from 'react';
import { fetchProductById } from '@/lib/client/products';

interface UseProductResult {
  product: Product | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  setAsCurrent: () => void;
}

export const useProduct = (productOrId?: string | Product): UseProductResult => {
  const { getProduct, setCurrentProduct, addProduct } = useProductStore();
  let id : string | undefined;
  if ((productOrId as Product).id) {
    addProduct(productOrId as Product);
    id = (productOrId as Product).id;
  } else {
    id = productOrId as string;
  }
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [product, setProduct] = useState<Product | null>(id ? getProduct(id) : null);

  const fetchProduct = useCallback(async (forceRefresh = false) => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Check if product exists in store first (unless forceRefresh is true)
      if (!forceRefresh) {
        const cachedProduct = getProduct(id);
        if (cachedProduct) {
          setProduct(cachedProduct);
          setLoading(false);
          return;
        }
      }
      
      // Fetch from API if not in store using our shared API layer
      const data = await fetchProductById(id);
      
      // Add to store
      addProduct(data);
      setProduct(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      console.error('Error fetching product:', err);
    } finally {
      setLoading(false);
    }
  }, [id, getProduct, addProduct]);

  const refetch = () => fetchProduct(true);

  const setAsCurrent = useCallback(() => {
    if (product) {
      setCurrentProduct(product);
    }
  }, [product, setCurrentProduct]);

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id, fetchProduct]);

  return {
    product,
    loading,
    error,
    refetch,
    setAsCurrent
  };
};
