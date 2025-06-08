'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useCheckout } from '@/hooks/checkout/useCheckout';
import { useCustomer } from '@/hooks/customer/useCustomer';
import Addresses from './checkout-addresses';
import ContactData from './contact-data';
import OrderSummary from './order-summary';
import PaymentMethodComponent from './payment-method';
import ShippingMethod from './shipping-method';

interface CheckoutProps {
  onComplete?: (orderId: string) => void;
}

/**
 * Single-page checkout component
 * Combines all checkout steps into a single form
 */
const Checkout: React.FC<CheckoutProps> = ({ onComplete }) => {
  const { processCheckout, loading, error, orderResponse, checkoutCart } = useCheckout();
  const { customer, loading: customerLoading } = useCustomer();
  const router = useRouter();
  const t = useTranslations('Checkout');

  // We don't need local state anymore as we're using the checkout store via useCheckout
  const [formErrors] = useState<Record<string, string>>({});
  const [isSubmitting] = useState(false);

  // Handle successful checkout
  useEffect(() => {
    if (orderResponse && orderResponse.orderId) {
      if (onComplete) {
        onComplete(orderResponse.orderId);
      } else {
        // Navigate to confirmation page
        router.push(`/confirmation/${orderResponse.orderId}`);
      }
    }
  }, [orderResponse, onComplete, router]);

  if (customerLoading || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-neutral-900 mb-4">{t('title')}</h1>
          <p className="text-neutral-600">{t('loading')}</p>
        </div>
      </div>
    );
  }
  // If no customer is available, show a message
  if (!checkoutCart) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-neutral-900 mb-4">{t('title')}</h1>
          <p className="text-neutral-600">{t('emptyCart')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-neutral-900 mb-6">{t('title')}</h1>
      {error && (
        <div className="mb-6 p-4 bg-danger-50 border border-danger-200 rounded-md">
          <p className="text-danger-700">{error.message}</p>
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Customer Information */}
          {!customer && <ContactData />}

          {/* Addresses */}
          <Addresses />

          {/* Shipping Method */}
          <ShippingMethod />

          {/* Payment Method */}
          <PaymentMethodComponent />

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

          {/* Submit Button */}
          <div className="mt-8">
            <button
              type="submit"
              onClick={processCheckout}
              disabled={isSubmitting || loading}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-70"
            >
              {isSubmitting || loading ? t('processing') : t('placeOrder')}
            </button>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <OrderSummary />
        </div>
      </div>
    </div>
  );
};

export default Checkout;
