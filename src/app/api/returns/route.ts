import { NextRequest, NextResponse } from 'next/server';
import server from '@/platform/server';
import type { LoggerService } from '@/platform/services/logger/LoggerService';
import { ReturnService } from '@/platform/services/return/ReturnService';

export const revalidate = 0;

/**
 * GET /api/returns
 * Get all returns for the current customer with optional pagination, sorting, and filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pageNumber = searchParams.get('pageNumber') ? parseInt(searchParams.get('pageNumber')!) : 1;
    const pageSize = searchParams.get('pageSize') ? parseInt(searchParams.get('pageSize')!) : 60;
    const sort = searchParams.get('sort') || undefined;
    const query = searchParams.get('query') || undefined;

    const returnService = server.get<ReturnService>('ReturnService');
    const returns = await returnService.getReturns(pageNumber, pageSize, sort, query);

    return NextResponse.json(returns);
  } catch (error) {
    const logger = server.get<LoggerService>('LoggerService');
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        path: '/api/returns',
        method: 'GET',
      },
      'Error fetching returns',
    );
    return NextResponse.json({ error: 'Failed to fetch returns' }, { status: 500 });
  }
}

/**
 * POST /api/returns
 * Create a new return for an order
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, items } = body;

    // Validate required fields
    if (!orderId || typeof orderId !== 'string') {
      return NextResponse.json({ error: 'orderId is required and must be a string' }, { status: 400 });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'items array is required and cannot be empty' }, { status: 400 });
    }

    // Validate item structure
    for (const item of items) {
      if (!item.id || typeof item.id !== 'string') {
        return NextResponse.json({ error: 'Each item must have a valid id' }, { status: 400 });
      }
      if (typeof item.quantity !== 'number' || item.quantity <= 0) {
        return NextResponse.json({ error: 'Each item must have a positive quantity' }, { status: 400 });
      }
    }

    const returnService = server.get<ReturnService>('ReturnService');
    const returnId = await returnService.createReturn(orderId, items);

    return NextResponse.json({ id: returnId }, { status: 201 });
  } catch (error) {
    const logger = server.get<LoggerService>('LoggerService');
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        path: '/api/returns',
        method: 'POST',
      },
      'Error creating return',
    );
    return NextResponse.json({ error: 'Failed to create return' }, { status: 500 });
  }
}
