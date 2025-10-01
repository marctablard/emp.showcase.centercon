import { NextRequest, NextResponse } from 'next/server';
import { format } from 'date-fns';
import server from '@/platform/server';
import type { QuoteHistoryItem } from '@/platform/services/model/quote';
import type { QuoteService } from '@/platform/services/quote/QuoteService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const quoteId = searchParams.get('quoteId');

    const formatDate = (dateString?: string) => {
      if (!dateString) return '-';
      return format(new Date(dateString), 'dd.MM.yyyy');
    };

    if (!quoteId) {
      return NextResponse.json({ error: 'Quote ID is required' }, { status: 400 });
    }

    const quoteService = server.get<QuoteService>('QuoteService');
    const history = await quoteService.getQuoteHistory(quoteId);

    // Filter history to only include comment changes and format the data
    const commentHistory = history
      .filter((item: QuoteHistoryItem) => item.path === '/comment')
      .map((item: QuoteHistoryItem) => ({
        comment: item.newValue?.employeeComment || '',
        userFullName: `${item.userFirstName || ''} ${item.userLastName || ''}`.trim(),
        modifiedAt: formatDate(item.modifiedAt),
        rawModifiedAt: item.modifiedAt,
      }))
      .sort((a: any, b: any) => {
        if (!a.rawModifiedAt || !b.rawModifiedAt) return 0;
        return new Date(a.rawModifiedAt).getTime() - new Date(b.rawModifiedAt).getTime();
      });

    return NextResponse.json({ history: commentHistory });
  } catch (error) {
    console.error('Failed to fetch quote history:', error);
    return NextResponse.json({ error: 'Failed to fetch quote history' }, { status: 500 });
  }
}
