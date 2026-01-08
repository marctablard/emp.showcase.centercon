import { NextRequest, NextResponse } from 'next/server';
import { getServerLogger } from '@/lib/logger/server-logger';
import server from '@/platform/server';
import { CartService } from '@/platform/services/cart';

/**
 * GET /api/carts/[id]
 * Get a specific cart by ID
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const cartId = resolvedParams.id;
  try {
    const cartService = server.get<CartService>('CartService');

    const cart = await cartService.getCartById(cartId);

    if (!cart) {
      return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
    }

    return NextResponse.json(cart);
  } catch (error) {
    const logger = getServerLogger();
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        path: `/api/cart/${cartId}`,
        method: 'GET',
        cartId,
      },
      `Error fetching cart ${cartId}`,
    );
    return NextResponse.json({ error: 'Failed to fetch cart' }, { status: 500 });
  }
}

/**
 * DELETE /api/carts/[id]
 * Delete a cart
 */
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const cartId = resolvedParams.id;
  try {
    const cartService = server.get<CartService>('CartService');

    await cartService.deleteCart(cartId);

    // Return success response
    return NextResponse.json({ success: true });
  } catch (error) {
    const logger = getServerLogger();
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        path: `/api/cart/${cartId}`,
        method: 'DELETE',
        cartId,
      },
      `Error deleting cart ${cartId}`,
    );
    return NextResponse.json({ error: 'Failed to delete cart' }, { status: 500 });
  }
}
