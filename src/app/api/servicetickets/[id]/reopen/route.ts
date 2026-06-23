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
 * POST /api/servicetickets/[id]/reopen
 * Reopen a terminal ticket.
 */
export async function POST(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  try {
    const service = server.get<ServiceTicketService>('ServiceTicketService');
    await service.reopenTicket(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    server.get<LoggerService>('LoggerService').error(
      {
        error: error instanceof Error ? error.message : String(error),
        path: `/api/servicetickets/${id}/reopen`,
        method: 'POST',
      },
      'Error reopening service ticket',
    );
    return NextResponse.json({ error: 'Failed to reopen ticket' }, { status: 500 });
  }
}
