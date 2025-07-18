'use server';

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { Cart } from '@/platform/services/model/cart/cart';
import { CartCookie, CartCookieEntry } from '../cart';

const CART_COOKIE_ID = process.env.NEXT_PUBLIC_CART_COOKIE || 'emp-cart';

async function readCartCookie(): Promise<CartCookie> {
  const cookieStore = await cookies();
  return JSON.parse(cookieStore.get(CART_COOKIE_ID)?.value || '{}');
}

/**
 * Retrieve the Cart ID for the supplied parameters
 * @param siteCode
 * @param currency
 * @param legalEntityId
 * @param channel
 * @returns cartId : string or undefined
 */
export async function getCartIdFromCookie(
  siteCode: string,
  currency: string,
  channel?: string,
  legalEntityId?: string,
): Promise<string | undefined> {
  const cart = await getCartCookie(siteCode, currency, channel, legalEntityId);
  return cart?.cartId;
}

export async function getCartCookie(
  siteCode: string,
  currency: string,
  channel?: string,
  legalEntityId?: string,
): Promise<CartCookieEntry | undefined> {
  const cartCookie: CartCookie = await readCartCookie();
  return cartCookie[siteCode]?.find(
    (cart) =>
      cart.currency === currency &&
      (!legalEntityId || cart.legalEntityId === legalEntityId) &&
      (!channel || cart.channel === channel),
  );
}

export async function removeCartFromCookie(cartId: string, response: NextResponse | Response): Promise<void> {
  const cartCookie: CartCookie = await readCartCookie();
  for (const siteCode of Object.keys(cartCookie)) {
    cartCookie[siteCode] = cartCookie[siteCode].filter((cart) => cart.cartId !== cartId);
  }

  // Handle both NextResponse and standard Response objects
  if ('cookies' in response && typeof response.cookies?.set === 'function') {
    // NextResponse object
    response.cookies.set({
      name: CART_COOKIE_ID,
      value: JSON.stringify(cartCookie),
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      sameSite: 'strict',
    });
  } else {
    // Standard Response object
    const cookieValue = `${CART_COOKIE_ID}=${encodeURIComponent(JSON.stringify(cartCookie))}; Path=/; Max-Age=${60 * 60 * 24 * 30}; SameSite=Strict`;

    // Use headers.append to add the Set-Cookie header
    response.headers.append('Set-Cookie', cookieValue);
  }
}

export async function addCartToCookie(cart: Cart, response: NextResponse | Response): Promise<void> {
  const cartCookie: CartCookie = await readCartCookie();
  if (!cartCookie[cart.site]) {
    cartCookie[cart.site] = [];
  }
  // TODO Multi-Cart support, currently only one supported!
  cartCookie[cart.site] = [
    {
      cartId: cart.id,
      currency: cart.currency,
      legalEntityId: cart.legalEntity,
      channel: cart.channel,
    },
  ];

  // Handle both NextResponse and standard Response objects
  if ('cookies' in response && typeof response.cookies?.set === 'function') {
    // NextResponse object
    response.cookies.set({
      name: CART_COOKIE_ID,
      value: JSON.stringify(cartCookie),
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      sameSite: 'strict',
    });
  } else {
    // Standard Response object
    const cookieValue = `${CART_COOKIE_ID}=${encodeURIComponent(JSON.stringify(cartCookie))}; Path=/; Max-Age=${60 * 60 * 24 * 30}; SameSite=Strict`;

    // Use headers.append to add the Set-Cookie header
    response.headers.append('Set-Cookie', cookieValue);
  }
}
