import { NextRequest, NextResponse } from 'next/server';
import { getServerLogger } from '@/lib/logger/server-logger';
import server from '@/platform/server';
import { CartService } from '@/platform/services/cart/CartService';

/**
 * Update shipping information for a cart
 * PATCH /api/cart/[id]/shipping
 */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: cartId } = await params;

  try {
    // Get the cart service
    const cartService = server.get<CartService>('CartService');

    // Parse the request body
    const { countryCode, zipCode } = await request.json();

    // Update shipping info
    await cartService.updateShippingInfo(cartId, countryCode, zipCode);

    // Return success response
    return NextResponse.json({ success: true });
  } catch (error) {
    const logger = getServerLogger();
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        path: `/api/cart/${cartId}/shipping`,
        method: 'PATCH',
        cartId,
      },
      'Error updating shipping info',
    );

    return NextResponse.json(
      { error: 'Failed to update shipping info', details: (error as Error).message },
      { status: 500 },
    );
  }
}
