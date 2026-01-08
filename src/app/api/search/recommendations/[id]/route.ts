import { NextRequest, NextResponse } from 'next/server';
import { getServerLogger } from '@/lib/logger/server-logger';
import server from '@/platform/server';
import { SearchService } from '@/platform/services/search/SearchService';

/**
 * API endpoint to get product recommendations based on a product ID
 * GET /api/search/recommendations/[id]
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: productId } = await params;

  try {
    const searchService = server.get<SearchService>('SearchService');

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const recommendations = await searchService.getRecommendations(productId);

    return NextResponse.json({ products: recommendations });
  } catch (error) {
    const logger = getServerLogger();
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        path: `/api/search/recommendations/${productId}`,
        method: 'GET',
        productId,
      },
      'Error fetching product recommendations',
    );
    return NextResponse.json({ error: 'Failed to fetch product recommendations' }, { status: 500 });
  }
}
