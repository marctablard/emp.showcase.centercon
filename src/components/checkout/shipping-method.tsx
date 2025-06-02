'use client';

import React, { useEffect, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { useCheckout } from '@/hooks/checkout/useCheckout';
import { Shipping } from '@/platform/services/model/checkout';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';

interface ShippingOption {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDelivery: string;
  zoneId: string;
}

interface ShippingMethodProps {
  initialMethod?: Shipping;
  isReadOnly?: boolean;
  form: UseFormReturn<any>;
}

/**
 * Shipping method selection component
 * Allows users to select their preferred shipping method
 */
const ShippingMethod: React.FC<ShippingMethodProps> = ({ isReadOnly = false, form }) => {
  // Get the submitShippingMethod function from useCheckout
  // Note: This doesn't exist yet, we'll need to add it to the useCheckout hook
  const { shippingMethod } = useCheckout();
  const t = useTranslations('Checkout');

  // Mock shipping options - in a real app, these would come from an API
  const shippingOptions: ShippingOption[] = [
    {
      id: 'de-standard',
      name: 'Standard Shipping',
      description: '3-5 business days',
      price: 4.95,
      estimatedDelivery: '3-5 business days',
      zoneId: 'de-default',
    },
    {
      id: 'express',
      name: 'Express Shipping',
      description: '1-2 business days',
      price: 9.99,
      estimatedDelivery: '1-2 business days',
      zoneId: 'de-default',
    },
    {
      id: 'overnight',
      name: 'Overnight Shipping',
      description: 'Next business day',
      price: 19.99,
      estimatedDelivery: 'Next business day',
      zoneId: 'de-default',
    },
  ];

  const [selectedMethod, setSelectedMethod] = useState<string>(shippingMethod?.methodId || 'standard');

  useEffect(() => {
    if (shippingMethod?.methodId) {
      setSelectedMethod(shippingMethod.methodId);
    }
  }, [shippingMethod]);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('shippingMethod')}</h2>
      <FormField
        control={form.control}
        name="shippingMethod"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <RadioGroup
                value={field.value}
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-col space-y-1"
              >
                {shippingOptions.map((option) => (
                  <FormItem className="flex items-center space-x-3 space-y-0 w-full" key={option.id}>
                    <div
                      className={`flex items-center w-full border rounded-md p-4 cursor-pointer transition-colors ${
                        selectedMethod === option.id
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 hover:border-indigo-300'
                      } ${isReadOnly ? 'opacity-75 pointer-events-none' : ''}`}
                    >
                      <FormControl>
                        <RadioGroupItem value={option.id} id={option.id} />
                      </FormControl>
                      <FormLabel className="w-full" htmlFor={option.id}>
                        <div className="flex items-start justify-between w-full">
                          <div className="flex items-center space-x-3">
                            <div
                              className={`flex items-center justify-center ${
                                selectedMethod === option.id ? 'border-indigo-600' : 'border-gray-300'
                              }`}
                            >
                              {selectedMethod === option.id && (
                                <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
                              )}
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900">{option.name}</h3>
                              <p className="text-sm text-gray-500">{option.description}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="font-medium">
                              {option.price === 0
                                ? t('freeShipping')
                                : new Intl.NumberFormat('en-US', {
                                    style: 'currency',
                                    currency: 'USD',
                                  }).format(option.price)}
                            </span>
                            <p className="text-xs text-gray-500">{option.estimatedDelivery}</p>
                          </div>
                        </div>
                      </FormLabel>
                    </div>
                  </FormItem>
                ))}
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default ShippingMethod;
