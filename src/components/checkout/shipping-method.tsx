'use client';

import React, { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';
import { useCheckout } from '@/hooks/checkout/useCheckout';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { useValidator } from '@/hooks/validation/useValidator';
import { Shipping } from '@/platform/services/model/checkout';

interface ShippingOption {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDelivery: string;
  zoneId: string;
}

interface ShippingMethodProps {
  isReadOnly?: boolean;
}

/**
 * Shipping method selection component
 * Allows users to select their preferred shipping method
 */
const ShippingMethod: React.FC<ShippingMethodProps> = ({ isReadOnly = false }) => {
  const { shippingMethod, submitShippingMethod } = useCheckout();
  const { form } = useValidator(
    'ShippingValidationService',
    shippingMethod,
    'onChange'
  );
  const t = useTranslations('Checkout');

  // Mock shipping options - in a real app, these would come from an API
  const shippingOptions: ShippingOption[] = [
    {
      id: 'de-standard',
      name: 'Standard Shipping',
      description: '3-5 business days',
      price: 5.0,
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

  const formState = form.formState;
  // Effect to auto-submit when all fields are valid and touched
  useEffect(() => {
    if (!formState.isValidating && formState.isValid) {
      const values = form.getValues() as Shipping;
      const option = shippingOptions.find((option) => option.id === values.methodId);
      if (option) {
        submitShippingMethod({
          methodId: option.id,
          methodName: option.name,
          amount: option.price,
          zoneId: option.zoneId,
        });
      }
    }
  }, [formState.isValidating, formState.isValid]);

  return (
    <FormProvider {...form}>
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">{t('shippingMethod')}</h2>
        <FormField
          control={form.control}
          name="methodId"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  {shippingOptions.map((option) => (
                    <FormItem className="flex items-center space-x-3 space-y-0 w-full" key={option.id}>
                      <div
                        className={`flex items-center w-full border rounded-md p-4 cursor-pointer transition-colors ${shippingMethod?.methodId === option.id
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-neutral-200 hover:border-primary-300'
                          } ${isReadOnly ? 'opacity-75 pointer-events-none' : ''}`}
                      >
                        <FormControl>
                          <RadioGroupItem value={option.id} id={option.id} />
                        </FormControl>
                        <FormLabel className="w-full" htmlFor={option.id}>
                          <div className="flex items-start justify-between w-full">
                            <div className="flex items-center space-x-3">
                              <div
                                className={`flex items-center justify-center ${shippingMethod?.methodId === option.id ? 'border-primary-600' : 'border-neutral-300'
                                  }`}
                              >
                                {shippingMethod?.methodId === option.id && (
                                  <div className="w-3 h-3 rounded-full bg-primary-600"></div>
                                )}
                              </div>
                              <div>
                                <h3 className="font-medium text-neutral-900">{option.name}</h3>
                                <p className="text-sm text-neutral-500">{option.description}</p>
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
                              <p className="text-xs text-neutral-500">{option.estimatedDelivery}</p>
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
    </FormProvider>
  );
};

export default ShippingMethod;
