import { NextRequest, NextResponse } from 'next/server';
import { getServerLogger } from '@/lib/logger/server-logger';
import server from '@/platform/server';
import { SessionService } from '@/platform/services/session/SessionService';

export const dynamic = 'force-dynamic';

/**
 * PUT /api/session/country
 * Update session country
 */
export async function PUT(request: NextRequest) {
  try {
    const sessionService = server.get<SessionService>('SessionService');
    const data = await request.json();

    if (!data.country) {
      return NextResponse.json({ error: 'Country is required' }, { status: 400 });
    }

    await sessionService.setCountry(data.country);

    return NextResponse.json({ success: true });
  } catch (error) {
    const logger = getServerLogger();
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        path: '/api/session/country',
        method: 'PUT',
      },
      'Error updating session country',
    );
    return NextResponse.json({ error: 'Failed to update session country' }, { status: 500 });
  }
}
