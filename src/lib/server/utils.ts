'use server';
import { cookies } from 'next/headers';
import { CartCookie } from '../../types/cart';
import { Cart } from '@/platform/services/model/cart/cart';
import { NextResponse } from 'next/server';

const CART_COOKIE_ID = process.env.NEXT_PUBLIC_CART_COOKIE_ID || 'emp-cart';


async function readCartCookie() : Promise<CartCookie> {
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
export async function getCartIdFromCookie(siteCode: string, currency: string, channel: string = 'storefront', legalEntityId?: string) : Promise<string | undefined> {
  const cartCookie : CartCookie = await readCartCookie();
  const cart = cartCookie[siteCode]?.find((cart) => 
    cart.currency === currency && 
    cart.legalEntityId === legalEntityId && 
    cart.channel === channel
  );
  return cart?.cartId;
}

export async function addCartToCookie(cart : Cart, response : NextResponse) : Promise<void> {
  const cartCookie : CartCookie = await readCartCookie();
  if (!cartCookie[cart.site]) {
    cartCookie[cart.site] = [];
  }
  cartCookie[cart.site].push({
    cartId: cart.id,
    currency: cart.currency,
    legalEntityId: cart.legalEntity,
    channel: cart.channel
  });
  
  response.cookies.set({
    name: CART_COOKIE_ID,
    value: JSON.stringify(cartCookie),
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    sameSite: 'strict',
  });
}