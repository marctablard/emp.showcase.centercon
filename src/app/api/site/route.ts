import { NextResponse } from 'next/server';
import { getServerLogger } from '@/lib/logger/server-logger';
import server from '@/platform/server';
import { SiteService } from '@/platform/services/site/SiteService';

/**
 * GET /api/site
 * Get site data (countries, regions, currencies)
 */
export async function GET() {
  try {
    const siteService = server.get<SiteService>('SiteService');
    const site = await siteService.getSite();
    const availableSites = await siteService.getAvailableSites();
    return NextResponse.json({ current: site, available: availableSites });
  } catch (error) {
    const logger = getServerLogger();
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        path: '/api/site',
        method: 'GET',
      },
      'Error fetching site data',
    );
    return NextResponse.json({ error: 'Failed to fetch site data' }, { status: 500 });
  }
}
