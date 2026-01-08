import { NextResponse } from 'next/server';
import { getServerLogger } from '@/lib/logger/server-logger';

export const dynamic = 'force-dynamic'; // No caching for this route

export async function GET() {
  try {
    // In a real implementation, this would use a GeoIP service
    // like ipinfo.io, ipapi.co, or a similar service

    // For now, we'll return mock data
    const mockGeoIPResponse = {
      city: 'Berlin',
      country: 'Germany',
      countryCode: 'DE',
      latitude: 52.52,
      longitude: 13.405,
      region: 'Berlin',
      regionCode: 'BE',
      postalCode: '10115',
      timezone: 'Europe/Berlin',
    };

    return NextResponse.json(mockGeoIPResponse);
  } catch (error) {
    const logger = getServerLogger();
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        path: '/api/location',
        method: 'GET',
      },
      'Error in location API route',
    );
    return NextResponse.json({ error: 'Failed to determine location' }, { status: 500 });
  }
}
