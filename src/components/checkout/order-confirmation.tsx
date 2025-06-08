'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { useOrder } from '@/hooks/order';
import { formatCurrency } from '@/lib/utils';
import { Order } from '@/platform/services/model/order/order';

interface OrderConfirmationProps {
  orderId: string;
  initialOrder?: Order | null;
  customerEmail?: string;
}

/**
 * Order confirmation component
 * Displays confirmation details after a successful checkout
 */
const OrderConfirmation: React.FC<OrderConfirmationProps> = ({ orderId, initialOrder, customerEmail }) => {
  const t = useTranslations('Confirmation');
  const { order, loading, error } = useOrder({ orderId, initialOrder });

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-success-100 rounded-full mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-success-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">{t('orderConfirmed')}</h1>
        <p className="text-lg text-neutral-600">{t('thankYou')}</p>
      </div>

      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          <p>{t('errorFetchingOrder')}</p>
          <p className="text-sm">{error.message}</p>
        </div>
      )}

      {order && (
        <>
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">{t('orderDetails')}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">{t('orderNumber')}</p>
                <p className="font-medium">{order.id || orderId}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">{t('orderDate')}</p>
                <p className="font-medium">
                  {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : new Date().toLocaleDateString()}
                </p>
              </div>

              {customerEmail && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">{t('email')}</p>
                  <p className="font-medium">{customerEmail}</p>
                </div>
              )}

              <div>
                <p className="text-sm text-gray-600 mb-1">{t('status')}</p>
                <p className="font-medium capitalize">{order.status}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">{t('paymentMethod')}</p>
                <p className="font-medium">{(order.payments && order.payments[0]?.method) || 'Credit Card'}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">{t('total')}</p>
                <p className="font-medium">
                  {order.price?.total?.gross
                    ? formatCurrency(order.price.total.gross, order.price.total.currency || order.currency || 'EUR')
                    : ''}
                </p>
              </div>
            </div>
          </div>

          {/* Order Items */}
          {order.items && order.items.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">{t('orderItems')}</h2>

              <div className="divide-y divide-gray-200">
                {order.items.map((item) => (
                  <div key={item.id} className="py-4 flex flex-wrap md:flex-nowrap">
                    <div className="md:w-16 md:h-16 w-full h-24 bg-gray-100 rounded mb-4 md:mb-0 md:mr-4 flex-shrink-0">
                      {item.images && item.images[0] && (
                        <Image
                          src={item.images[0]}
                          alt={item.name || ''}
                          width={150}
                          height={150}
                          className="w-full h-full object-cover rounded"
                        />
                      )}
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-medium">{item.name || `Product ${item.productId}`}</h3>
                      <p className="text-sm text-gray-500">
                        {t('quantity')}: {item.quantity}
                      </p>
                      <p className="text-sm font-medium">
                        {item.price?.value ? formatCurrency(item.price.value, item.price.currency) : ''}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="mt-6 border-t border-gray-200 pt-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">{t('subtotal')}</span>
                  <span className="font-medium">
                    {order.price?.subtotal?.gross
                      ? formatCurrency(order.price.subtotal.gross, order.currency || 'EUR')
                      : ''}
                  </span>
                </div>

                {order.shipping && (
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">{t('shipping')}</span>
                    <span className="font-medium">
                      {order.shipping.total?.value
                        ? formatCurrency(
                            order.shipping.total.value,
                            order.shipping.total.currency || order.currency || 'EUR',
                          )
                        : t('free')}
                    </span>
                  </div>
                )}

                {order.discounts && order.discounts.length > 0 && (
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">{t('discount')}</span>
                    <span className="font-medium text-green-600">
                      -{order.discounts.reduce((sum, discount) => sum + (discount.value || 0), 0)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between pt-2 border-t border-gray-200">
                  <span className="font-medium">{t('total')}</span>
                  <span className="font-bold">
                    {order.price?.total?.gross ? formatCurrency(order.price.total.gross, order.currency || 'EUR') : ''}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Shipping Address */}
          {order.shippingAddress && (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">{t('shippingAddress')}</h2>
              <address className="not-italic">
                <p>{order.shippingAddress.contactName}</p>
                <p>{order.shippingAddress.street}</p>
                {order.shippingAddress.streetNumber && <p>{order.shippingAddress.streetNumber}</p>}
                <p>
                  {order.shippingAddress.zipCode} {order.shippingAddress.city}
                </p>
                <p>{order.shippingAddress.country}</p>
              </address>
            </div>
          )}
        </>
      )}

      <div className="mt-8 text-center space-y-4">
        <p className="text-neutral-600">
          {t('emailConfirmation')} {customerEmail || 'your email address'}.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200"
          >
            {t('continueShopping')}
          </Link>

          <Link
            href="/account/orders"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
          >
            {t('viewOrders')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
