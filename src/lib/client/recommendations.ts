import type { ProductRecommendations } from '@/platform/services/model/product';

export async function fetchRecommendations(productId: string): Promise<ProductRecommendations> {
  const res = await fetch(`/api/search/recommendations/${productId}`);
  if (!res.ok) throw new Error('Failed to fetch recommendations');
  return res.json();
}
