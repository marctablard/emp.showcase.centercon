import React from 'react';
import { redirect } from 'next/navigation';
import Checkout from '@/components/checkout/checkout';
import { getCurrentCart } from '@/lib/ssr/carts';

interface CheckoutPageProps {
  locale: string;
}
export default async function CheckoutPage({ params }: { params: Promise<CheckoutPageProps> }) {
  const { locale: _locale } = await params;
  const cart = await getCurrentCart();

  // Redirect to cart page if no cart exists or cart is empty
  if (!cart || cart.items.length === 0) {
    redirect('/cart');
  }

  return (
    <main className="min-h-screen bg-neutral-50 py-8">
      <Checkout />
    </main>
  );
}
