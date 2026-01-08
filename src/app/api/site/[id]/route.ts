import { NextRequest, NextResponse } from 'next/server';
import { getServerLogger } from '@/lib/logger/server-logger';
import server from '@/platform/server';
import { SiteService } from '@/platform/services/site/SiteService';

/**
 * GET /api/site/{id}
 * Get site data (countries, regions, currencies)
 */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const siteService = server.get<SiteService>('SiteService');
    const { id } = await params;
    const site = await siteService.getSite(id);

    return NextResponse.json(site);
  } catch (error) {
    const logger = getServerLogger();
    const { id } = await params;
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        path: `/api/site/${id}`,
        method: 'GET',
        siteId: id,
      },
      'Error fetching site data',
    );
    return NextResponse.json({ error: 'Failed to fetch site data' }, { status: 500 });
  }
}
