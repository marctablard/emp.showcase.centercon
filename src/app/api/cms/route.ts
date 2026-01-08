import { NextRequest, NextResponse } from 'next/server';
import { getServerLogger } from '@/lib/logger/server-logger';
import { CMSService } from '@/platform/services/cms/CMSService';
import ssr from '@/platform/ssr';

/**
 * GET /api/cms
 * Get CMS page data based on slug, locale, and site
 */
export async function GET(request: NextRequest) {
  // Get query parameters (outside try for logging context)
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug') || 'home';
  const locale = searchParams.get('locale') || 'de';
  const site = searchParams.get('site') || '';

  try {
    // Create CMS service instance
    const cmsService = ssr.get<CMSService>('CMSService');

    // Get page data
    const pageData = await cmsService.getPage(slug, locale, site);

    // Return response
    return NextResponse.json(pageData);
  } catch (error) {
    const logger = getServerLogger();
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        path: '/api/cms',
        method: 'GET',
        slug,
        locale,
        site,
      },
      'Error fetching CMS data',
    );
    return NextResponse.json({ error: 'Failed to fetch CMS data' }, { status: 500 });
  }
}
