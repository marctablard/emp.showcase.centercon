import { NextRequest, NextResponse } from 'next/server';
import server from '@/platform/server';
import type { LoggerService } from '@/platform/services/logger/LoggerService';
import { SessionService } from '@/platform/services/session/SessionService';
import { SiteService } from '@/platform/services/site/SiteService';

/**
 * PUT /api/session/site
 * Update session site
 */
export async function PUT(request: NextRequest) {
  try {
    const sessionService = server.get<SessionService>('SessionService');
    const siteService = server.get<SiteService>('SiteService');
    const data = await request.json();

    if (!data.site) {
      return NextResponse.json({ error: 'Site is required' }, { status: 400 });
    }
    const newSite = await siteService.getSite(data.site);
    if (!newSite) {
      return NextResponse.json({ error: 'Unknown Site' }, { status: 400 });
    }
    await sessionService.setSite(newSite.code);
    return NextResponse.json({ success: true });
  } catch (error) {
    const logger = server.get<LoggerService>('LoggerService');
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        path: '/api/session/site',
        method: 'PUT',
      },
      'Error updating session site',
    );
    return NextResponse.json({ error: 'Failed to update session site' }, { status: 500 });
  }
}
