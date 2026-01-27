import { NextRequest, NextResponse } from 'next/server';
import server from '@/platform/server';
import type { LoggerService } from '@/platform/services/logger/LoggerService';
import { SessionService } from '@/platform/services/session/SessionService';

/**
 * PUT /api/session/currency
 * Update session currency
 */
export async function PUT(request: NextRequest) {
  try {
    const sessionService = server.get<SessionService>('SessionService');
    const data = await request.json();

    if (!data.currency) {
      return NextResponse.json({ error: 'Currency is required' }, { status: 400 });
    }

    await sessionService.setCurrency(data.currency);

    return NextResponse.json({ success: true });
  } catch (error) {
    const logger = server.get<LoggerService>('LoggerService');
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        path: '/api/session/currency',
        method: 'PUT',
      },
      'Error updating session currency',
    );
    return NextResponse.json({ error: 'Failed to update session currency' }, { status: 500 });
  }
}
