'use client';

import React, { useState, useEffect } from 'react';
import { PaymentMethod as PaymentMethodType } from '@/platform/services/model/checkout';
import { useCheckout } from '@/hooks/checkout/useCheckout';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { UseFormReturn } from 'react-hook-form';
import { useTranslations } from 'next-intl';

interface PaymentMethodProps {
  initialMethod?: Partial<PaymentMethodType>;
  isReadOnly?: boolean;
  form: UseFormReturn<any>;
}

/**
 * Payment method selection component for checkout
 */
const PaymentMethodComponent: React.FC<PaymentMethodProps> = ({
  isReadOnly = false,
  form
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

  const t = useTranslations('Checkout');

  useEffect(() => {
    submitPaymentMethod(selectedMethod);
  }, [selectedMethod, submitPaymentMethod]);

  const handleMethodChange = (value: string) => {
    const method = paymentOptions.find(option => option.id === value);

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
        <FormField
          control={form.control}
          name="paymentMethod"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <RadioGroup
                  value={field.value}
                  onValueChange={(value) => { field.onChange(value); handleMethodChange(value); }}
                  className="flex flex-col space-y-1"
                >

                  <div className="space-y-6">
                    <div className="space-y-4">
                      {paymentOptions.map(option => (
                        <div key={option.id}>
                          <FormItem className="flex items-center">
                            <FormControl>
                              <RadioGroupItem value={option.id} id={option.id} />
                            </FormControl>
                            <FormLabel htmlFor={option.id} className="w-full ml-3 block text-sm font-medium text-gray-700"> {option.name}</FormLabel>
                          </FormItem>
                        </div>
                      ))}
                    </div>

                    {/* Credit Card Form */}
                    {selectedMethod.method === 'credit-card' && (
                      <div className="mt-6 space-y-4 border-t pt-4">
                        <div>
                          <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
                            {t('cardNumber')}
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
                            {t('cardHolder')}
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
                              {t('expiryDate')}
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
                              {t('cvv')}
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
                          {t('paypalRedirect')}
                        </p>
                      </div>
                    )}

                    {/* Invoice Form */}
                    {selectedMethod.method === 'invoice' && (
                      <div className="mt-6 border-t pt-4">
                        <p className="text-sm text-gray-600">
                          {t('invoiceTerms')}
                        </p>
                      </div>
                    )}
                  </div>


                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
