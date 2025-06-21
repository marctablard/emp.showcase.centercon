import { NextResponse } from 'next/server';
import { SiteService } from '@/platform/services/site/SiteService';

/**
 * GET /api/site
 * Get site data (countries, regions, currencies)
 */
export async function GET() {
  try {
    const siteService = EMP.platform.server.get<SiteService>('SiteService');
    const site = await siteService.getSite();
    return NextResponse.json(site);
  } catch (error) {
    console.error('Error fetching site data:', error);
    return NextResponse.json({ error: 'Failed to fetch site data' }, { status: 500 });
  }
}
