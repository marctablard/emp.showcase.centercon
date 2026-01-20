import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Readiness probe endpoint.
 *
 * Keep this local-only (env/config checks). Do NOT call upstream services,
 * otherwise probes can amplify outages into traffic spikes.
 */
export async function GET(): Promise<NextResponse> {
  const requiredEnv = ['NEXT_PUBLIC_EMPORIX_BASE_URL', 'NEXT_PUBLIC_EMPORIX_TENANT', 'NEXT_PUBLIC_EMPORIX_CLIENT_ID'];

  const missing = requiredEnv.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    return NextResponse.json(
      {
        status: 'not-ready',
        missing,
        timestamp: new Date().toISOString(),
      },
      {
        status: 503,
        headers: {
          'Cache-Control': 'no-store',
        },
      },
    );
  }

  return NextResponse.json(
    { status: 'ready', timestamp: new Date().toISOString() },
    {
      headers: {
        'Cache-Control': 'no-store',
      },
    },
  );
}
