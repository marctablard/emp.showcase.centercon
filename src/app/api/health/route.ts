import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Liveness probe endpoint.
 *
 * Must be fast and must NOT call upstream services.
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    { status: 'ok', timestamp: new Date().toISOString() },
    {
      headers: {
        'Cache-Control': 'no-store',
      },
    },
  );
}
