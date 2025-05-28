'use client';

import React, { useState, useEffect } from 'react';
import { PaymentMethod as PaymentMethodType } from '@/platform/services/model/checkout';
import { useCheckout } from '@/hooks/checkout/useCheckout';

interface PaymentMethodProps {
  initialMethod?: Partial<PaymentMethodType>;
  isReadOnly?: boolean;
}

/**
 * Payment method selection component for checkout
 */
const PaymentMethodComponent: React.FC<PaymentMethodProps> = ({
  isReadOnly = false
}) => {
  const { paymentMethod, submitPaymentMethod } = useCheckout();
  // Available payment methods
  const paymentOptions = [
    { id: 'credit-card', name: 'Credit Card', provider: 'payment-gateway', method: 'credit-card' },
    { id: 'paypal', name: 'PayPal', provider: 'payment-gateway', method: 'paypal' },
    { id: 'invoice', name: 'Pay by Invoice', provider: 'none', method: 'invoice' },
  ];

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType>({
    provider: 'payment-gateway',
    method: 'credit-card',
    ...paymentMethod
  });

  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: ''
  });

  useEffect(() => {
    submitPaymentMethod(selectedMethod);
  }, [selectedMethod, submitPaymentMethod]);

  const handleMethodChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const method = paymentOptions.find(option => option.id === e.target.value);
    if (method) {
      setSelectedMethod({
        provider: method.provider,
        method: method.method,
        customAttributes: selectedMethod.customAttributes
      });
    }
  };

  const handleCardDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCardDetails({
      ...cardDetails,
      [name]: value
    });

    // Update the payment method with card details
    if (selectedMethod.method === 'credit-card') {
      setSelectedMethod({
        ...selectedMethod,
        customAttributes: {
          ...selectedMethod.customAttributes,
          [name]: value
        }
      });
    }
  };

  return (
    <div className="space-y-6 bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold text-gray-800">Payment Method</h2>

      {!isReadOnly ? (
        <div className="space-y-6">
          <div className="space-y-4">
            {paymentOptions.map(option => (
              <div key={option.id} className="flex items-center">
                <input
                  id={option.id}
                  name="paymentMethod"
                  type="radio"
                  value={option.id}
                  checked={selectedMethod.method === option.method}
                  onChange={handleMethodChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                />
                <label htmlFor={option.id} className="ml-3 block text-sm font-medium text-gray-700">
                  {option.name}
                </label>
              </div>
            ))}
          </div>

          {/* Credit Card Form */}
          {selectedMethod.method === 'credit-card' && (
            <div className="mt-6 space-y-4 border-t pt-4">
              <div>
                <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Card Number
                </label>
                <input
                  type="text"
                  id="cardNumber"
                  name="cardNumber"
                  value={cardDetails.cardNumber}
                  onChange={handleCardDetailsChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="1234 5678 9012 3456"
                />
              </div>
              
              <div>
                <label htmlFor="cardHolder" className="block text-sm font-medium text-gray-700 mb-1">
                  Card Holder
                </label>
                <input
                  type="text"
                  id="cardHolder"
                  name="cardHolder"
                  value={cardDetails.cardHolder}
                  onChange={handleCardDetailsChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="John Doe"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    id="expiryDate"
                    name="expiryDate"
                    value={cardDetails.expiryDate}
                    onChange={handleCardDetailsChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="MM/YY"
                  />
                </div>
                
                <div>
                  <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">
                    CVV
                  </label>
                  <input
                    type="text"
                    id="cvv"
                    name="cvv"
                    value={cardDetails.cvv}
                    onChange={handleCardDetailsChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="123"
                  />
                </div>
              </div>
            </div>
          )}

          {/* PayPal Form */}
          {selectedMethod.method === 'paypal' && (
            <div className="mt-6 border-t pt-4">
              <p className="text-sm text-gray-600">
                You will be redirected to PayPal to complete your payment after reviewing your order.
              </p>
            </div>
          )}

          {/* Invoice Form */}
          {selectedMethod.method === 'invoice' && (
            <div className="mt-6 border-t pt-4">
              <p className="text-sm text-gray-600">
                You will receive an invoice for this order. Payment is due within 30 days.
              </p>
            </div>
          )}
        </div>
      ) : (
        // Read-only view
        <div className="text-gray-700">
          <p className="font-medium">
            {paymentOptions.find(option => option.method === selectedMethod.method)?.name || 'Selected payment method'}
          </p>
          
          {selectedMethod.method === 'credit-card' && selectedMethod.customAttributes?.cardNumber && (
            <p className="text-sm text-gray-600 mt-1">
              Card ending in {selectedMethod.customAttributes.cardNumber.slice(-4)}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default PaymentMethodComponent;
