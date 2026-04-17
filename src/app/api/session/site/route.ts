import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import server from '@/platform/server';
import type { LoggerService } from '@/platform/services/logger/LoggerService';
import type { SessionService } from '@/platform/services/session/SessionService';
import type { SiteService } from '@/platform/services/site/SiteService';

/**
 * PUT /api/session/site
 * Update session site
 */
export async function PUT(request: NextRequest) {
  try {
    const sessionService = server.get<SessionService>('SessionService');
    const siteService = server.get<SiteService>('SiteService');
    const logger = server.get<LoggerService>('LoggerService');
    const data = await request.json();

    if (!data.site) {
      return NextResponse.json({ error: 'Site is required' }, { status: 400 });
    }

    logger.info({ targetSite: data.site }, 'PUT /api/session/site — updating session site');

    const newSite = await siteService.getSite(data.site);
    if (!newSite) {
      return NextResponse.json({ error: 'Unknown Site' }, { status: 400 });
    }
    await sessionService.setSite(newSite.code, newSite.defaultCurrency.id);
    logger.info({ site: newSite.code, currency: newSite.defaultCurrency.id }, 'Session site updated successfully');

    const response = NextResponse.json({ success: true });
    // Keep the site cookie in sync with the user's selected site so the edge middleware
    // (which honours cookieOverridesDefault) does not redirect back to the previously
    // selected non-default site on the next navigation to `/`.
    const siteCookieName = process.env.NEXT_PUBLIC_SITE_COOKIE || 'NEXT_SITE';
    response.cookies.set({
      name: siteCookieName,
      value: newSite.code,
      maxAge: 365 * 24 * 60 * 60,
      httpOnly: false,
      sameSite: 'lax',
      path: '/',
    });
    return response;
  } catch (error) {
    const logger = server.get<LoggerService>('LoggerService');
    const errorMessage = error instanceof Error ? error.message : String(error);
    const isVersionConflictError =
      errorMessage.includes('Failed to update own session context: Not Found') &&
      errorMessage.includes('version') &&
      errorMessage.includes('has not been found');

    logger.error(
      {
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
        errorType: isVersionConflictError ? 'SESSION_CONTEXT_VERSION_CONFLICT' : 'UNKNOWN',
        path: '/api/session/site',
        method: 'PUT',
      },
      'Error updating session site',
    );
    if (isVersionConflictError) {
      return NextResponse.json(
        {
          error: 'Failed to update session site',
          code: 'SESSION_CONTEXT_VERSION_CONFLICT',
        },
        { status: 500 },
      );
    }
    return NextResponse.json(
      { error: 'Failed to update session site', code: 'SESSION_SITE_UPDATE_FAILED' },
      { status: 500 },
    );
  }
}
