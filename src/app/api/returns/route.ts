import { NextRequest, NextResponse } from 'next/server';
import { computeOrderReturnability } from '@/lib/common/returns/returnability';
import server from '@/platform/server';
import type { LoggerService } from '@/platform/services/logger/LoggerService';
import type { OrderService } from '@/platform/services/order/OrderService';
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
    const { orderId, items, reasonCode } = body;

    if (!orderId || typeof orderId !== 'string') {
      return NextResponse.json({ error: 'orderId is required and must be a string' }, { status: 400 });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'items array is required and cannot be empty' }, { status: 400 });
    }

    if (!reasonCode || typeof reasonCode !== 'string') {
      return NextResponse.json({ error: 'reasonCode is required and must be a string' }, { status: 400 });
    }

    for (const item of items) {
      if (!item.id || typeof item.id !== 'string') {
        return NextResponse.json({ error: 'Each item must have a valid id' }, { status: 400 });
      }
      if (typeof item.quantity !== 'number' || item.quantity <= 0) {
        return NextResponse.json({ error: 'Each item must have a positive quantity' }, { status: 400 });
      }
    }

    const returnService = server.get<ReturnService>('ReturnService');

    try {
      const orderService = server.get<OrderService>('OrderService');
      const [order, orderReturns] = await Promise.all([
        orderService.getCustomerOrderById(orderId),
        returnService.getReturns(undefined, undefined, undefined, `orders._id:${orderId}`),
      ]);

      if (order) {
        const returnability = computeOrderReturnability(orderId, order.items, orderReturns);

        const remainingMap = new Map(returnability.orderItemSummaries.map((s) => [s.itemId, s.remaining]));

        for (const item of items) {
          const remaining = remainingMap.get(item.id);
          if (remaining !== undefined && item.quantity > remaining) {
            const logger = server.get<LoggerService>('LoggerService');
            logger.warn(
              { orderId, itemId: item.id, requested: item.quantity, remaining },
              'Over-return attempt blocked',
            );
            return NextResponse.json(
              {
                error: `Item ${item.id} exceeds returnable quantity (requested: ${item.quantity}, remaining: ${remaining})`,
              },
              { status: 422 },
            );
          }
        }
      }
    } catch (validationError) {
      const logger = server.get<LoggerService>('LoggerService');
      logger.warn(
        { error: validationError instanceof Error ? validationError.message : String(validationError), orderId },
        'Returnability validation skipped due to error',
      );
    }

    const returnId = await returnService.createReturn(orderId, items, reasonCode);

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
