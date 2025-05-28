import React from 'react';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { getCurrentCart } from '@/lib/ssr/carts';
import Checkout from '@/components/checkout/checkout';

interface CheckoutPageProps {
  locale: string;
}



export default async function CheckoutPage({ params }: {params: Promise<CheckoutPageProps>}) {
  const {locale : _locale} = await params;
  const cart = await getCurrentCart();
  
  // Redirect to cart page if no cart exists or cart is empty
  if (!cart || cart.items.length === 0) {
    redirect('/cart');
  }
  
  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <Checkout />
    </main>
  );
}
