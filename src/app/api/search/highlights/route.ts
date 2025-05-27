import { NextRequest, NextResponse } from 'next/server';
import { SearchService } from '@/platform/services/search/SearchService';

/**
 * API endpoint to get highlighted products
 * GET /api/search/highlights
 */
export async function GET(request: NextRequest) {
  try {
    const searchService = await globalThis.EMP.platform.server.get<SearchService>('SearchService');
    
    
    const highlights = await searchService.getHighlights();
    
    return NextResponse.json({ products: highlights });
  } catch (error) {
    console.error('Error fetching highlighted products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch highlighted products' },
      { status: 500 }
    );
  }
}
