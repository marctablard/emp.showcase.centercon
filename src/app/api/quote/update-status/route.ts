import { NextRequest, NextResponse } from 'next/server';
import server from '@/platform/server';
import { QuoteService } from '@/platform/services/quote/QuoteService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { quoteId, status, comment, locale } = body;

    if (!quoteId) {
      return NextResponse.json({ error: 'Quote ID is required' }, { status: 400 });
    }

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    const quoteService = server.get<QuoteService>('QuoteService');

    let quoteReasonId = undefined;
    if (status === 'DECLINED') {
      quoteReasonId = await createDeclinedQuoteReason(quoteId, comment, locale, quoteService);
    }
    await quoteService.updateQuote(
      quoteId,
      'replace',
      '/status',
      {
        value: status,
        comment: comment || '',
        quoteReasonId: quoteReasonId || '',
      },
      'session',
    );

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error updating quote status:', error);
    const message = error instanceof Error ? error.message : 'Failed to update quote status';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
async function createDeclinedQuoteReason(quoteId: any, comment: any, locale: any, quoteService: QuoteService) {
  let quoteReasonId = undefined;
  const quoteId_current = `${quoteId}_${Date.now()}`;
  const code = `${(comment || quoteId_current).toUpperCase().replace(/\s+/g, '_')}`;

  const message: Record<string, string> = {};
  message[locale] = comment || 'Price too high';

  const response = await quoteService.createQuoteReason({
    code: code,
    type: 'DECLINE',
    message: message,
  });
  quoteReasonId = response.id;
  return quoteReasonId;
}
