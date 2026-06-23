import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import server from '@/platform/server';
import type { LoggerService } from '@/platform/services/logger/LoggerService';
import type { ServiceTicketService } from '@/platform/services/serviceticket/ServiceTicketService';

export const revalidate = 0;

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/servicetickets/[id]/feedback
 * Submit customer satisfaction feedback for a ticket.
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  try {
    const body = await request.json();
    const score = Number(body.score);
    if (!Number.isFinite(score) || score < 1 || score > 5) {
      return NextResponse.json({ error: 'A rating between 1 and 5 is required' }, { status: 400 });
    }
    const comment = typeof body.comment === 'string' ? body.comment : undefined;

    const service = server.get<ServiceTicketService>('ServiceTicketService');
    await service.submitFeedback(id, score, comment);

    return NextResponse.json({ success: true });
  } catch (error) {
    server.get<LoggerService>('LoggerService').error(
      {
        error: error instanceof Error ? error.message : String(error),
        path: `/api/servicetickets/${id}/feedback`,
        method: 'POST',
      },
      'Error submitting service ticket feedback',
    );
    return NextResponse.json({ error: 'Failed to submit feedback' }, { status: 500 });
  }
}
