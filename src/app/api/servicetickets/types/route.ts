import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getPublicDefaultLanguage } from '@/lib/common/public-default-env';
import server from '@/platform/server';
import type { LoggerService } from '@/platform/services/logger/LoggerService';
import type { ServiceTicketService } from '@/platform/services/serviceticket/ServiceTicketService';

export const revalidate = 0;

/**
 * GET /api/servicetickets/types
 * Get the request types available to customers.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale') || getPublicDefaultLanguage();

    const service = server.get<ServiceTicketService>('ServiceTicketService');
    const types = await service.getTicketTypes(locale);

    return NextResponse.json(types);
  } catch (error) {
    server.get<LoggerService>('LoggerService').error(
      {
        error: error instanceof Error ? error.message : String(error),
        path: '/api/servicetickets/types',
        method: 'GET',
      },
      'Error fetching service ticket types',
    );
    return NextResponse.json({ error: 'Failed to fetch request types' }, { status: 500 });
  }
}
