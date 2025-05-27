import { NextRequest, NextResponse } from 'next/server';
import { SearchService } from '@/platform/services/search/SearchService';

/**
 * API endpoint to get product recommendations based on a product ID
 * GET /api/search/recommendations/[id]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;
    const searchService = await globalThis.EMP.platform.server.get<SearchService>('SearchService');
    
    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }
    
    const recommendations = await searchService.getRecommendations(productId);
    
    return NextResponse.json({ products: recommendations });
  } catch (error) {
    console.error('Error fetching product recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product recommendations' },
      { status: 500 }
    );
  }
}
