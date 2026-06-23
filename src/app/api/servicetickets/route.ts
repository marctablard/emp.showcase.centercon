import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getPublicDefaultLanguage } from '@/lib/common/public-default-env';
import server from '@/platform/server';
import type { LoggerService } from '@/platform/services/logger/LoggerService';
import type { CreateServiceTicketInput } from '@/platform/services/model/serviceticket';
import type { ServiceTicketService } from '@/platform/services/serviceticket/ServiceTicketService';

export const revalidate = 0;

/**
 * GET /api/servicetickets
 * List the current customer's service tickets.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale') || getPublicDefaultLanguage();
    const pageNumber = searchParams.get('pageNumber') ? parseInt(searchParams.get('pageNumber')!, 10) : 1;
    const pageSize = searchParams.get('pageSize') ? parseInt(searchParams.get('pageSize')!, 10) : 60;

    const service = server.get<ServiceTicketService>('ServiceTicketService');
    const { items, totalCount } = await service.listTickets(locale, pageNumber, pageSize);

    return NextResponse.json(items, {
      headers: totalCount !== undefined ? { 'x-total-count': String(totalCount) } : undefined,
    });
  } catch (error) {
    server
      .get<LoggerService>('LoggerService')
      .error(
        { error: error instanceof Error ? error.message : String(error), path: '/api/servicetickets', method: 'GET' },
        'Error fetching service tickets',
      );
    return NextResponse.json({ error: 'Failed to fetch service tickets' }, { status: 500 });
  }
}

/**
 * POST /api/servicetickets
 * Create a new service ticket for the current customer.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const locale = body.locale || getPublicDefaultLanguage();

    if (!body.typeId || typeof body.typeId !== 'string') {
      return NextResponse.json({ error: 'A request type is required' }, { status: 400 });
    }
    if (!body.subject || typeof body.subject !== 'string' || body.subject.trim() === '') {
      return NextResponse.json({ error: 'A subject is required' }, { status: 400 });
    }
    if (!body.summary || typeof body.summary !== 'string' || body.summary.trim() === '') {
      return NextResponse.json({ error: 'A description is required' }, { status: 400 });
    }

    const input: CreateServiceTicketInput = {
      typeId: body.typeId,
      subject: body.subject.trim(),
      summary: body.summary.trim(),
      businessImpact: typeof body.businessImpact === 'string' ? body.businessImpact : undefined,
      properties: body.properties && typeof body.properties === 'object' ? body.properties : undefined,
    };

    const service = server.get<ServiceTicketService>('ServiceTicketService');
    const id = await service.createTicket(input, locale);

    return NextResponse.json({ id }, { status: 201 });
  } catch (error) {
    server
      .get<LoggerService>('LoggerService')
      .error(
        { error: error instanceof Error ? error.message : String(error), path: '/api/servicetickets', method: 'POST' },
        'Error creating service ticket',
      );
    return NextResponse.json({ error: 'Failed to create service ticket' }, { status: 500 });
  }
}
