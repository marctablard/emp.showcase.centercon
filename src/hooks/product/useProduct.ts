'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useHistory } from '@/hooks/history/useHistory';
import { useSession } from '@/hooks/session/useSession';
import { useSite } from '@/hooks/site/useSite';
import { fetchProductById } from '@/lib/client/products';
import {
  isProductPriceDisplayableForPurchase,
  stripProductPriceIfNotDisplayableForShopContext,
} from '@/lib/common/product-price-site-context';
import { getLogger } from '@/lib/logger/use-logger-client';
import type { Product } from '@/platform/services/model/product';
import type { ProductFetchOptions } from '@/platform/services/product/ProductService';
import { useProductStore } from '@/providers/StoreProvider';

interface UseProductResult {
  currentProductId: string | null;
  product: Product | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  setAsCurrent: (isCurrent?: boolean) => void;
}

export const useProduct = (productOrId?: string | Product, options?: ProductFetchOptions): UseProductResult => {
  const { session } = useSession();
  const { site } = useSite();
  const { getProduct, setCurrentProduct, addProduct, currentProductId } = useProductStore();

  let id: string | undefined;
  if (!productOrId) {
    id = currentProductId || undefined;
  } else {
    if ((productOrId as Product).id) {
      id = (productOrId as Product).id;
    } else {
      id = productOrId as string;
    }
  }

  const [loading, setLoading] = useState<boolean>(() => {
    if (!id) return false;
    if (productOrId && typeof productOrId === 'object' && (productOrId as Product).id) {
      return false;
    }
    return true;
  });
  const [error, setError] = useState<Error | null>(null);
  const [product, setProduct] = useState<Product | null>(() => {
    if (!id) return null;
    if (productOrId && typeof productOrId === 'object' && (productOrId as Product).id) {
      return productOrId as Product;
    }
    return getProduct(id);
  });

  const fetchProduct = useCallback(
    async (forceRefresh = false, clientDedupeScope = '') => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);

        if (!forceRefresh) {
          const cachedProduct = getProduct(id);
          if (
            cachedProduct?.price?.currency &&
            isProductPriceDisplayableForPurchase(cachedProduct.price.currency, session, site)
          ) {
            setProduct(cachedProduct);
            setLoading(false);
            return;
          }
        }

        if (forceRefresh) {
          setProduct(null);
        } else {
          setProduct((p) => (p && p.id !== id ? null : p));
        }

        const data = await fetchProductById(id, options, clientDedupeScope);
        const next =
          data && session?.currency ? stripProductPriceIfNotDisplayableForShopContext(data, session, site) : data;
        if (next) {
          addProduct(next);
        }
        setProduct(next);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An unknown error occurred'));
        getLogger().error({ err }, 'Error fetching product');
      } finally {
        setLoading(false);
      }
    },
    [id, getProduct, addProduct, options, session?.currency, session?.siteCode, site],
  );

  const refetch = useCallback(async () => {
    const scope = session?.siteCode && session?.currency ? `${session.siteCode}|${session.currency}` : '';
    await fetchProduct(true, scope);
  }, [session?.siteCode, session?.currency, fetchProduct]);

  const productForUi = useMemo(() => {
    if (!product) {
      return product;
    }
    return stripProductPriceIfNotDisplayableForShopContext(product, session ?? null, site);
  }, [product, session, site]);

  const { addLastSeenProduct } = useHistory();

  const setAsCurrent = useCallback(
    (isCurrent: boolean = true) => {
      if (productForUi && isCurrent) {
        setCurrentProduct(productForUi);
      } else {
        setCurrentProduct(null);
      }
    },
    [productForUi, setCurrentProduct],
  );

  useEffect(() => {
    if (currentProductId) {
      const product = getProduct(currentProductId);
      if (product) {
        // Add to last seen products when setting as current
        addLastSeenProduct(product);
      }
    }
  }, [currentProductId, addLastSeenProduct, getProduct]);

  const sessionPricingKey = session?.siteCode && session?.currency ? `${session.siteCode}|${session.currency}` : '';
  const prevSessionPricingKeyRef = useRef<string | null>(null);
  const prevProductIdRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (prevProductIdRef.current !== id) {
      prevProductIdRef.current = id;
      prevSessionPricingKeyRef.current = null;
    }
  }, [id]);

  useEffect(() => {
    if (!id) {
      return;
    }
    if (!sessionPricingKey) {
      return;
    }

    if (prevSessionPricingKeyRef.current === null) {
      prevSessionPricingKeyRef.current = sessionPricingKey;
      const cached = getProduct(id);
      const reuseCache =
        !!cached &&
        !!cached.price?.currency &&
        isProductPriceDisplayableForPurchase(cached.price.currency, session, site);
      void fetchProduct(!reuseCache, sessionPricingKey);
      return;
    }

    if (prevSessionPricingKeyRef.current !== sessionPricingKey) {
      prevSessionPricingKeyRef.current = sessionPricingKey;
      void fetchProduct(true, sessionPricingKey);
    }
  }, [id, sessionPricingKey, fetchProduct, getProduct, site, session?.currency]);

  return {
    currentProductId,
    product: productForUi,
    loading,
    error,
    refetch,
    setAsCurrent,
  };
};
