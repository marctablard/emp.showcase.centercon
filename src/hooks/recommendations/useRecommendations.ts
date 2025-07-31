import { useEffect, useState } from 'react';
import { fetchRecommendations } from '@/lib/client/recommendations';
import type { ProductRecommendations } from '@/platform/services/model/product';

export function useRecommendations(productId?: string) {
  const [recommendations, setRecommendations] = useState<ProductRecommendations | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!productId) {
      setRecommendations(undefined);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    fetchRecommendations(productId)
      .then(setRecommendations)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [productId]);

  return { recommendations, loading, error };
}
