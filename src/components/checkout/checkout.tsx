'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useCheckout } from '@/hooks/checkout/useCheckout';
import { useCustomer } from '@/hooks/customer/useCustomer';
import { H1 } from '../ui/h';
import { Spinner } from '../ui/spinner';
import { CheckoutItemlist } from './checkout-itemlist';
import { CheckoutPayment } from './checkout-payment';
import { CheckoutShipping } from './checkout-shipping';
import CheckoutSummary from './checkout-summary';
import ContactData from './contact-data';

interface CheckoutProps {
  onComplete?: (orderId: string) => void;
}

/**
 * Single-page checkout component
 * Combines all checkout steps into a single form
 */
const Checkout: React.FC<CheckoutProps> = ({ onComplete }) => {
  const { loading, error, orderResponse, checkoutCart, processCheckout } = useCheckout();
  const { customer } = useCustomer();
  const router = useRouter();
  const t = useTranslations('Checkout');
  const leftContent = useRef<HTMLDivElement>(null);

  // We don't need local state anymore as we're using the checkout store via useCheckout
  const [formErrors] = useState<Record<string, string>>({});

  // Handle successful checkout
  useEffect(() => {
    if (orderResponse && orderResponse.orderId) {
      if (onComplete) {
        onComplete(orderResponse.orderId);
      } else {
        // Navigate to confirmation page
        router.push(`/confirmation/${orderResponse.orderId}`);
        router.refresh();
      }
    }
  }, [orderResponse, onComplete, router]);

  if (customer === undefined || loading || orderResponse) {
    return (
      <div className="mx-4 xl:mx-9">
        <div className="flex gap-3 align-end mb-8">
          <H1 variant="h3" className="text-5xl font-bold">
            {t('title')}
          </H1>
        </div>
        <div className="flex flex-col items-center justify-center py-12">
          <Spinner variant="lg" />
        </div>
      </div>
    );
  }
  // If no customer is available, show a message
  if (!checkoutCart) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-neutral-900 mb-4">{t('title')}</h1>
          <p className="text-neutral-600">{t('emptyCart')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {error && (
        <div className="mb-6 p-4 bg-danger-50 border border-danger-200 rounded-md">
          <p className="text-danger-700">{error.message}</p>
        </div>
      )}
      <div className="mx-4 xl:mx-9">
        <div className="flex gap-3 align-end mb-8">
          <H1 variant="h3" className="text-5xl font-bold">
            {t('title')}
          </H1>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 2xl:grid-cols-4 gap-8">
          <div className="col-span-1 lg:col-span-2 2xl:col-span-3" ref={leftContent}>
            {!customer && <ContactData />}
            <CheckoutShipping initialEdit={false} />
            <CheckoutPayment initialEdit={false} />
            {/*<CheckoutNotes />*/}
            <CheckoutItemlist />

            {/* Form Errors */}
            {Object.keys(formErrors).length > 0 && (
              <div className="p-4 bg-danger-50 border border-danger-200 rounded-md">
                <h3 className="text-sm font-medium text-danger-800 mb-2">{t('formErrors')}</h3>
                <ul className="list-disc pl-5 text-sm text-danger-700 space-y-1">
                  {Object.entries(formErrors).map(([key, value]) => (
                    <li key={key}>{value}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div className="col-span-1 mb-6 flex">
            <CheckoutSummary leftContent={leftContent} onSubmit={processCheckout} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
