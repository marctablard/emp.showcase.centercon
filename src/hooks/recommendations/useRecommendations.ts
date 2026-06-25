import { useCallback, useEffect, useState } from 'react';
import { fetchRecommendations } from '@/lib/client/recommendations';
import type { ProductRecommendations } from '@/platform/services/model/product';

export function useRecommendations(productId?: string, locale?: string) {
  const [recommendations, setRecommendations] = useState<ProductRecommendations | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRecommendations = useCallback(async (id: string, currentLocale?: string, isCancelled?: () => boolean) => {
    setRecommendations(undefined);
    setLoading(true);
    setError(null);

    try {
      const result = await fetchRecommendations(id, currentLocale);
      if (isCancelled?.()) return;
      setRecommendations(result);
    } catch (err) {
      if (isCancelled?.()) return;
      setError((err as Error).message);
    } finally {
      if (isCancelled?.()) return;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!productId) {
      return;
    }

    let cancelled = false;

    void loadRecommendations(productId, locale, () => cancelled);

    return () => {
      cancelled = true;
    };
  }, [productId, locale, loadRecommendations]);

  const hasProduct = Boolean(productId);
  const pending = hasProduct && !loading && !error && recommendations === undefined;

  return {
    recommendations: hasProduct ? recommendations : undefined,
    loading: hasProduct && (loading || pending),
    error: hasProduct ? error : null,
  };
}
