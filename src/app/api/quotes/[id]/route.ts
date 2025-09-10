import { NextRequest, NextResponse } from 'next/server';
import type { QuoteService } from '@/platform/services/quote/QuoteService';

/**
 * GET /api/quotes/[id] - Returns details of a specific quote
 */
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const quoteService = EMP.platform.server.get<QuoteService>('QuoteService');
    const { id: quoteId } = await params;

    const quote = await quoteService.getQuote(quoteId);

    return NextResponse.json(quote);
  } catch (error) {
    console.error(`Error fetching quote ${params.id}:`, error);
    return NextResponse.json({ error: 'Failed to fetch quote' }, { status: 500 });
  }
}
