import { NextRequest, NextResponse } from 'next/server';
import server from '@/platform/server';
import type { LoggerService } from '@/platform/services/logger/LoggerService';
import { ReturnService } from '@/platform/services/return/ReturnService';

export const revalidate = 0;

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/returns/[id]
 * Get a specific return by ID
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  try {
    const returnService = server.get<ReturnService>('ReturnService');
    const returnItem = await returnService.getReturn(id);

    if (!returnItem) {
      return NextResponse.json({ error: 'Return not found' }, { status: 404 });
    }

    return NextResponse.json(returnItem);
  } catch (error) {
    const logger = server.get<LoggerService>('LoggerService');
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        path: `/api/returns/${id}`,
        method: 'GET',
        returnId: id,
      },
      `Error fetching return ${id}`,
    );
    return NextResponse.json({ error: 'Failed to fetch return' }, { status: 500 });
  }
}
