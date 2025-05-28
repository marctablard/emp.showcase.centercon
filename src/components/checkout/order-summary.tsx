'use client';

import React from 'react';
import { Cart } from '@/platform/services/model/cart/cart';
import Image from 'next/image';
import { useCheckout } from '@/hooks/checkout/useCheckout';
import { useL10n } from '@/hooks/useL10n';

interface OrderSummaryProps {
  isReadOnly?: boolean;
}

/**
 * Order summary component for checkout
 * Displays cart items, subtotal, shipping, and total
 */
const OrderSummaryComponent: React.FC<OrderSummaryProps> = ({ isReadOnly = false }) => {
  const { checkoutCart: cart } = useCheckout();
  const { l10n } = useL10n();
  if (!cart) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Order Summary</h2>
        <p className="text-gray-500">No items in cart</p>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm ${isReadOnly ? 'p-4' : 'p-6'}`}>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Order Summary</h2>
      
      {/* Cart Items */}
      <div className="space-y-4 mb-6">
        {cart.items.map((item) => (
          <div key={item.id} className="flex items-center space-x-4">
            {/* Product Image */}
            <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-md overflow-hidden">
              {item.product?.images && item.product.images.length > 0 ? (
                <Image
                  src={item.product.images[0].url}
                  alt={l10n(item.product?.name || 'Product')}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                  <span className="text-gray-400 text-xs">No image</span>
                </div>
              )}
            </div>
            
            {/* Product Details */}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-gray-800 truncate">
                {l10n(item.product?.name || 'Product')}
              </h3>
              <p className="text-sm text-gray-500">
                Qty: {item.quantity}
              </p>
            </div>
            
            {/* Price */}
            <div className="text-sm font-medium text-gray-900">
              {(item.price?.currency || '€')} {((item.price?.amount || 0) * item.quantity).toFixed(2)}
            </div>
          </div>
        ))}
      </div>
      
      {/* Price Breakdown */}
      <div className="space-y-2 border-t border-gray-200 pt-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-medium">{cart.currency} {cart.subTotalPrice.amount.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between text-base font-medium pt-2 border-t border-gray-200 mt-2">
          <span className="text-gray-900">Total</span>
          <span className="text-gray-900">{cart.currency} {cart.totalPrice.amount.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default OrderSummaryComponent;
