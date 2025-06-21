import React from 'react';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { OrderConfirmation } from '@/components/checkout';
import { getOrderById } from '@/lib/ssr/orders';

interface ConfirmationPageProps {
  orderId: string;
  locale: string;
}

export async function generateMetadata({ params }: { params: Promise<ConfirmationPageProps> }): Promise<Metadata> {
  const { locale } = await params;

  const t = await getTranslations({ locale, namespace: 'Confirmation' });

  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function ConfirmationPage({ params }: { params: Promise<ConfirmationPageProps> }) {
  // In a real application, we would fetch the order details from the API
  // For now, we'll use a placeholder cart
  const { orderId } = await params;
  const order = await getOrderById(orderId);

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <OrderConfirmation orderId={orderId} initialOrder={order} customerEmail={order?.customerEmail || ''} />
    </main>
  );
}
