import { NextRequest, NextResponse } from 'next/server';
import { getServerLogger } from '@/lib/logger/server-logger';
import server from '@/platform/server';
import { QuoteUpdateRequest } from '@/platform/services/model/quote';
import type { QuoteService } from '@/platform/services/quote/QuoteService';

export async function POST(request: NextRequest) {
  let quoteId: string | undefined;

  try {
    const body = await request.json();
    quoteId = body.quoteId;
    const { comment } = body;

    if (!quoteId || !comment) {
      return NextResponse.json({ error: 'Quote ID and comment are required' }, { status: 400 });
    }

    const quoteService = server.get<QuoteService>('QuoteService');
    const updateList: QuoteUpdateRequest[] = [];
    updateList.push({
      op: 'REPLACE',
      path: '/mixins/additionalInfo',
      value: { reference: body.reference, userComment: comment },
    });

    await quoteService.updateQuote(quoteId, updateList, 'service');

    return NextResponse.json({ success: true });
  } catch (error) {
    const logger = getServerLogger();
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        path: '/api/quote/add-comment',
        method: 'POST',
        quoteId,
      },
      'Error adding comment to quote',
    );
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to add comment to quote' },
      { status: 500 },
    );
  }
}
