import { NextRequest, NextResponse } from 'next/server';
import { addCartToCookie, getCartCookie } from '@/lib/server/utils';
import { CartService } from '@/platform/services/cart';
import type { Cart } from '@/platform/services/model/cart';

const CART_COOKIE_ID = process.env.NEXT_PUBLIC_CART_COOKIE_ID || 'emp-cart';
const DEFAULT_CURRENCY = 'EUR';
const DEFAULT_SITE_CODE = 'main';

/**
 * GET /api/carts
 * Get the current cart or create a new one if none exists
 * @param {Object} params - Request parameters
 * @param {boolean} [params.create=true] - Whether to create a new cart if one doesn't exist
 */
export async function GET(request: NextRequest) {
  try {
    // Parse URL to check for 'create' parameter
    const { searchParams } = new URL(request.url);
    const create = searchParams.get('create') === 'true'; // Default to false if not specified

    const cartService = globalThis.EMP.platform.server.get<CartService>('CartService');

    // Check for cart ID in cookies
    const cartCookie = await getCartCookie(DEFAULT_SITE_CODE, DEFAULT_CURRENCY);
    let cart: Cart | null | undefined;
    if (cartCookie) {
      // Try to get existing cart
      try {
        cart = await cartService.getCartById(cartCookie.cartId);
      } catch (_error) {
        // this will try fetching for the cart by session-id
        cart = await cartService.getCart();
        // if cart is missing, try to reconstruct from cookie
        if (!cart && cartCookie.items) {
          // TODO alternative approach re-assign cart with Server-Token
          console.warn('Error getting cart, reconstructing from Cookie');
          const newCartId = await cartService.createCart(cartCookie.currency, DEFAULT_SITE_CODE);
          if (newCartId) {
            for (const item of cartCookie.items) {
              await cartService.addItemToCart(newCartId, item.pId, item.qty);
            }
            const newCart = await cartService.getCartById(newCartId);
            return NextResponse.json(newCart);
          }
        }
      }
    }

    // If we don't have a cart and shouldCreate is false, return 204 (intentionally empty)
    if (!cart && create) {
      // Create a new cart
      const newCartId = await cartService.createCart(DEFAULT_CURRENCY, DEFAULT_SITE_CODE);
      if (!newCartId) {
        return NextResponse.json({ error: 'Failed to create cart' }, { status: 500 });
      }
      cart = await cartService.getCartById(newCartId);
    }
    // null found for cart
    if (cart === null) {
      return new Response(null, { status: 204 });
    }
    // undefined, so it's an Error
    if (cart === undefined) {
      return NextResponse.json({ error: 'Failed to find Cart' }, { status: 404 });
    }
    // Set cookie for the new cart
    const response = NextResponse.json(cart);
    if (cartCookie?.cartId != cart.id) {
      await addCartToCookie(cart, response);
    }
    return response;
  } catch (error) {
    console.error('Error handling cart request:', error);
    return NextResponse.json({ error: 'Failed to process cart request' }, { status: 500 });
  }
}

/**
 * POST /api/carts
 * Create a new cart
 */
export async function POST(request: NextRequest) {
  try {
    const cartService = globalThis.EMP.platform.server.get<CartService>('CartService');

    // Get request body
    const body = await request.json();
    const currency = body.currency || DEFAULT_CURRENCY;
    const siteCode = body.siteCode || DEFAULT_SITE_CODE;

    // Create a new cart
    const cartId = await cartService.createCart(currency, siteCode);
    const cart = await cartService.getCartById(cartId);

    // Set cookie for the new cart
    const response = NextResponse.json(cart);
    response.cookies.set({
      name: CART_COOKIE_ID,
      value: cartId,
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      sameSite: 'lax',
    });

    return response;
  } catch (error) {
    console.error('Error creating cart:', error);
    return NextResponse.json({ error: 'Failed to create cart' }, { status: 500 });
  }
}
