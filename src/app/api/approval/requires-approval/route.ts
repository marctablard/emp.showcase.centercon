import { NextRequest, NextResponse } from 'next/server';
import { getServerLogger } from '@/lib/logger/server-logger';
import server from '@/platform/server';
import { ApprovalService } from '@/platform/services/approval/ApprovalService';

export const revalidate = 0;

/**
 * GET /api/approval/requires-approval
 * Check if a cart requires approval
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const cartId = searchParams.get('cartId');

  try {
    if (!cartId) {
      return NextResponse.json({ error: 'Cart ID is required' }, { status: 400 });
    }

    const approvalService = server.get<ApprovalService>('ApprovalService');
    const requiresApproval = await approvalService.requiresApproval(cartId);

    return NextResponse.json(requiresApproval);
  } catch (error) {
    const logger = getServerLogger();
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        path: '/api/approval/requires-approval',
        method: 'GET',
        cartId,
      },
      'Error checking approval requirements',
    );
    return NextResponse.json(
      { error: 'Failed to check approval requirements', details: (error as Error).message },
      { status: 500 },
    );
  }
}
