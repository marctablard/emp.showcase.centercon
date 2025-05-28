import React from 'react';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import OrderConfirmation from '@/components/checkout/order-confirmation';

interface ConfirmationPageProps {
  orderId: string;
  locale: string;
}

export async function generateMetadata({ params }: {params: Promise<ConfirmationPageProps>}): Promise<Metadata> {
  const { locale } = await params;
  
  const t = await getTranslations({ locale, namespace: 'Confirmation' });
  
  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function ConfirmationPage({ params }: {params: Promise<ConfirmationPageProps>}) {
  // In a real application, we would fetch the order details from the API
  // For now, we'll use a placeholder cart
  const { orderId }  = (await params);
  const placeholderCart = {
    id: 'cart-123',
    currency: 'EUR',
    items: [
      {
        id: 'item-1',
        quantity: 2,
        price: {
          value: 29.99,
          currency: 'EUR'
        },
        product: {
          id: 'product-1',
          name: 'Sample Product',
          description: 'This is a sample product',
          images: ['https://via.placeholder.com/150']
        }
      }
    ]
  };
  
  return (
    <main className="min-h-screen bg-gray-50 py-8">
      {/*
      <OrderConfirmation 
        orderId={orderId}
        cart={placeholderCart}
        customerEmail="customer@example.com"
      />
      */}
    </main>
  );
}
