import { useEffect, useState } from 'react';
import { fetchRecommendations } from '@/lib/client/recommendations';
import type { ProductRecommendations } from '@/platform/services/model/product';

export function useRecommendations(productId?: string, locale?: string) {
  const [recommendations, setRecommendations] = useState<ProductRecommendations | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!productId) {
      setRecommendations(undefined);
      setLoading(false);
      setError(null);
      return;
    }

    let isCancelled = false;

    setRecommendations(undefined);
    setLoading(true);
    setError(null);

    fetchRecommendations(productId, locale)
      .then((result) => {
        if (!isCancelled) setRecommendations(result);
      })
      .catch((err) => {
        if (!isCancelled) setError((err as Error).message);
      })
      .finally(() => {
        if (!isCancelled) setLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [productId, locale]);

  const hasProduct = Boolean(productId);
  const pending = hasProduct && !loading && !error && recommendations === undefined;

  return {
    recommendations: hasProduct ? recommendations : undefined,
    loading: hasProduct && (loading || pending),
    error: hasProduct ? error : null,
  };
}
