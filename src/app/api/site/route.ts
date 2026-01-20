import { NextResponse } from 'next/server';
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

    // Return 404 if site is null
    if (!site) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    }

    return NextResponse.json({ current: site, available: availableSites });
  } catch (error) {
    console.error('Error fetching site data:', error);
    return NextResponse.json({ error: 'Failed to fetch site data' }, { status: 500 });
  }
}
