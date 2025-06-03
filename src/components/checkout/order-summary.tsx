'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { useCheckout } from '@/hooks/checkout/useCheckout';

interface OrderSummaryProps {
  isReadOnly?: boolean;
}

/**
 * Order summary component for checkout
 * Displays cart items, subtotal, shipping, and total
 */
const OrderSummaryComponent: React.FC<OrderSummaryProps> = ({ isReadOnly = false }) => {
  const { checkoutCart: cart } = useCheckout();
  const t = useTranslations('Checkout');

  if (!cart) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">{t('summaryTitle')}</h2>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm ${isReadOnly ? 'p-4' : 'p-6'}`}>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">{t('summaryTitle')}</h2>

      {/* Price Breakdown */}
      <div className="space-y-2 border-gray-200 pt-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">{t('subtotal')}</span>
          <span className="font-medium">
            {cart.currency} {cart.subTotalPrice.amount.toFixed(2)}
          </span>
        </div>

        <div className="flex justify-between text-base font-medium pt-2 border-t border-gray-200 mt-2">
          <span className="text-gray-900">{t('total')}</span>
          <span className="text-gray-900">
            {cart.currency} {cart.totalPrice.amount.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default OrderSummaryComponent;
