import { NextRequest, NextResponse } from 'next/server';
import { getServerLogger } from '@/lib/logger/server-logger';
import server from '@/platform/server';
import { SearchService } from '@/platform/services/search/SearchService';

/**
 * API endpoint to get highlighted products
 * GET /api/search/highlights
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(request: NextRequest) {
  try {
    const searchService = server.get<SearchService>('SearchService');

    const highlights = await searchService.getHighlights();

    return NextResponse.json({ products: highlights });
  } catch (error) {
    const logger = getServerLogger();
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        path: '/api/search/highlights',
        method: 'GET',
      },
      'Error fetching highlighted products',
    );
    return NextResponse.json({ error: 'Failed to fetch highlighted products' }, { status: 500 });
  }
}
