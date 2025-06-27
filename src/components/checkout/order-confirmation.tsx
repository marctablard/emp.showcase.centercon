'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { Check, Package, ReceiptText } from 'lucide-react';
import useCustomer from '@/hooks/customer/useCustomer';
import { useOrder } from '@/hooks/order/useOrder';
import { formatCurrency } from '@/lib/utils';
import { Order } from '@/platform/services/model/order/order';
import { AddressDisplay } from '../common/address-display';
import { Card, CardContent, CardHeader } from '../ui/card';
import { H2 } from '../ui/h';

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
  const tOrder = useTranslations('Orders');
  const tOrderStatus = useTranslations('OrderStatus');
  const tPayment = useTranslations('PaymentModes');
  const { customer } = useCustomer();
  const { order, loading, error } = useOrder({ orderId, initialOrder });

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-success-100 rounded-full mb-4">
          <Check className="h-8 w-8 text-success-600" />
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
          <p>{tOrder('errorFetchingOrder')}</p>
          <p className="text-sm">{error.message}</p>
        </div>
      )}

      {order && (
        <>
          <Card className="mb-8">
            <CardHeader>
              <H2 variant="h5">{tOrder('orderDetails')}</H2>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-md text-gray-600 mb-1">{tOrder('orderNumber')}</p>
                <p className="font-medium">{order.id || orderId}</p>
              </div>

              <div>
                <p className="text-md text-gray-600 mb-1">{tOrder('orderDate')}</p>
                <p className="font-medium">
                  {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : new Date().toLocaleDateString()}
                </p>
              </div>

              {customerEmail && (
                <div>
                  <p className="text-md text-gray-600 mb-1">{tOrder('email')}</p>
                  <p className="font-medium">{customerEmail}</p>
                </div>
              )}

              <div>
                <p className="text-md text-gray-600 mb-1">{tOrder('columns.status')}</p>
                <p className="font-medium capitalize">{tOrderStatus(order.status)}</p>
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          {order.items && order.items.length > 0 && (
            <Card className="mb-8">
              <CardHeader>
                <H2 variant="h5">{tOrder('orderItems')}</H2>
              </CardHeader>
              <CardContent>
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
                        {tOrder('quantity')}: {item.quantity}
                      </p>
                      <p className="text-sm font-medium">
                        {item.price?.value ? formatCurrency(item.price.value, item.price.currency) : ''}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Order Summary */}
                <div className="mt-6 border-t border-gray-200 pt-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">{tOrder('subtotal')}</span>
                    <span className="font-medium">
                      {order.price?.subtotal?.gross
                        ? formatCurrency(order.price.subtotal.gross, order.currency || 'EUR')
                        : ''}
                    </span>
                  </div>

                  {order.shipping && (
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">{tOrder('shipping')}</span>
                      <span className="font-medium">
                        {order.shipping.total?.value
                          ? formatCurrency(
                              order.shipping.total.value,
                              order.shipping.total.currency || order.currency || 'EUR',
                            )
                          : tOrder('free')}
                      </span>
                    </div>
                  )}

                  {order.discounts && order.discounts.length > 0 && (
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">{tOrder('discount')}</span>
                      <span className="font-medium text-green-600">
                        -{order.discounts.reduce((sum, discount) => sum + (discount.value || 0), 0)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between pt-2 border-t border-gray-200">
                    <span className="font-medium">{tOrder('total')}</span>
                    <span className="font-bold">
                      {order.price?.total?.gross
                        ? formatCurrency(order.price.total.gross, order.currency || 'EUR')
                        : ''}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Shipping Address */}
          {order.shippingAddress && (
            <Card className="mb-8">
              <CardHeader>
                <H2 variant="h5">{tOrder('shipping')}</H2>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col pb-4">
                  <p className="font-bold mb-1">{tOrder('shippingAddress')}</p>
                  <div className="flex align-center">
                    {order.shippingAddress && <AddressDisplay address={order.shippingAddress} />}
                  </div>
                </div>
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col">
                    <p className="font-bold mb-1">{tOrder('shippingMethod')}</p>
                    <div className="flex align-center">
                      <div>
                        <Package className="h-4 w-4 mt-1.5 mr-1.5" />
                      </div>
                      <div>
                        <p>{order.shipping?.methods?.[0]?.name || 'Unknown'}</p>
                        {/*<p>Arrives on July 12, 2025</p>*/}
                      </div>
                    </div>
                  </div>
                  {/*
              <div className="flex flex-col">
                <p className="font-bold mb-1">{t('freightShipping')}</p>
                <div className="flex align-center">
                  <div>
                    <Truck className="h-4 w-4 mt-1.5 mr-1.5" />
                  </div>
                  <div>
                    <p>{t('freightInfo')}</p>
                  </div>
                </div>
              </div>
              */}
                </div>
              </CardContent>
            </Card>
          )}
          {/* Payment Method */}
          <Card className="mb-8">
            <CardHeader>
              <H2 variant="h5">{tOrder('payment')}</H2>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="font-bold mb-1">{tOrder('billingAddress')}</p>

                <div className="flex align-center">
                  {order.billingAddress && <AddressDisplay address={order.billingAddress} />}
                </div>
              </div>
              <div className="flex align-center">
                <div>
                  <ReceiptText className="h-4 w-4 mt-1.5 mr-1.5" />
                </div>
                <div>
                  <p className="font-bold">{tPayment(order.payments?.[0]?.method || 'none')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
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

          {customer && (
            <Link
              href="/account/orders"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              {t('viewOrders')}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
