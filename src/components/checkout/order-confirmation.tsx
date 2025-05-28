'use client';

import React from 'react';
import Link from 'next/link';
import { CheckoutResponse } from '@/platform/services/model/checkout';
import { Cart } from '@/platform/services/model/cart/cart';
import OrderSummary from './order-summary';
import { useTranslations } from 'next-intl';

interface OrderConfirmationProps {
  orderId: string;
  cart: Cart | null;
  customerEmail?: string;
}

/**
 * Order confirmation component
 * Displays confirmation details after a successful checkout
 */
const OrderConfirmation: React.FC<OrderConfirmationProps> = ({
  orderId,
  cart,
  customerEmail
}) => {
  const t = useTranslations('Confirmation');
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-8 w-8 text-green-600" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M5 13l4 4L19 7" 
            />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('orderConfirmed')}</h1>
        <p className="text-lg text-gray-600">
          {t('thankYou')}
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">{t('orderDetails')}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-1">{t('orderNumber')}</p>
            <p className="font-medium">{orderId}</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-600 mb-1">{t('orderDate')}</p>
            <p className="font-medium">{new Date().toLocaleDateString()}</p>
          </div>
          
          {customerEmail && (
            <div>
              <p className="text-sm text-gray-600 mb-1">{t('email')}</p>
              <p className="font-medium">{customerEmail}</p>
            </div>
          )}
          
          <div>
            <p className="text-sm text-gray-600 mb-1">{t('paymentMethod')}</p>
            <p className="font-medium">Credit Card</p>
          </div>
        </div>
      </div>

      {/* Order Summary */}
      

      <div className="mt-8 text-center space-y-4">
        <p className="text-gray-600">
          {t('emailConfirmation')} {customerEmail || 'your email address'}.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6">
          <Link 
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
          >
            {t('continueShopping')}
          </Link>
          
          <Link 
            href="/account/orders"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            {t('viewOrders')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
