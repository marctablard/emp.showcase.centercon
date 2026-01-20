import { NextRequest, NextResponse } from 'next/server';
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

    // Return 404 if site is null
    if (!site) {
      return NextResponse.json({ error: `Site with id '${id}' not found` }, { status: 404 });
    }

    return NextResponse.json(site);
  } catch (error) {
    console.error('Error fetching site data:', error);
    return NextResponse.json({ error: 'Failed to fetch site data' }, { status: 500 });
  }
}
