import { NextRequest, NextResponse } from 'next/server';
import type { QuoteService } from '@/platform/services/quote/QuoteService';

/**
 * GET /api/quotes - Returns a list of quotes
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const quoteService = EMP.platform.server.get<QuoteService>('QuoteService');

    // Parse query parameters
    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get('query') || undefined;
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : 0;
    const size = searchParams.get('size') ? parseInt(searchParams.get('size')!) : 20;
    const sort = searchParams.get('sort') || undefined;

    // Get quotes with filters
    const response = await quoteService.getQuotes({
      page,
      size,
      sort,
      query,
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching quotes:', error);
    return NextResponse.json({ error: 'Failed to fetch quotes' }, { status: 500 });
  }
}
