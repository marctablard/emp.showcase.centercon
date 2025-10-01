import { NextRequest, NextResponse } from 'next/server';
import server from '@/platform/server';
import type { QuoteService } from '@/platform/services/quote/QuoteService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { quoteId, comment } = body;

    if (!quoteId || !comment) {
      return NextResponse.json({ error: 'Quote ID and comment are required' }, { status: 400 });
    }

    const quoteService = server.get<QuoteService>('QuoteService');
    await quoteService.updateQuote(quoteId, 'replace', '/comment', comment, 'service');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error adding comment to quote:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to add comment to quote' },
      { status: 500 },
    );
  }
}
