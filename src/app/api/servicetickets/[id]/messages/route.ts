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
 * POST /api/servicetickets/[id]/messages
 * Append a customer reply to the ticket conversation.
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  try {
    const body = await request.json();
    if (!body.message || typeof body.message !== 'string' || body.message.trim() === '') {
      return NextResponse.json({ error: 'A message is required' }, { status: 400 });
    }

    const service = server.get<ServiceTicketService>('ServiceTicketService');
    await service.addCustomerMessage(id, body.message.trim());

    return NextResponse.json({ success: true });
  } catch (error) {
    server.get<LoggerService>('LoggerService').error(
      {
        error: error instanceof Error ? error.message : String(error),
        path: `/api/servicetickets/${id}/messages`,
        method: 'POST',
      },
      'Error adding service ticket message',
    );
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
