import { NextRequest, NextResponse } from 'next/server';
import { getServerLogger } from '@/lib/logger/server-logger';
import server from '@/platform/server';
import type { QuoteService } from '@/platform/services/quote/QuoteService';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const quoteId = searchParams.get('quoteId');

  try {
    if (!quoteId) {
      return NextResponse.json({ error: 'Quote ID is required' }, { status: 400 });
    }

    const quoteService = server.get<QuoteService>('QuoteService');
    const history = await quoteService.getQuoteHistory(quoteId);

    return NextResponse.json({ history });
  } catch (error) {
    const logger = getServerLogger();
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        path: '/api/quote/history',
        method: 'GET',
        quoteId,
      },
      'Failed to fetch quote history',
    );
    return NextResponse.json({ error: 'Failed to fetch quote history' }, { status: 500 });
  }
}
