'use client';

import React, { useEffect } from 'react';
import { FormProvider } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { useCheckout } from '@/hooks/checkout/useCheckout';
import { useValidator } from '@/hooks/validation/useValidator';
import type { ShippingMethod } from '@/platform/services/model/shipping';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Spinner } from '../ui/spinner';

interface ShippingMethodProps {
  isReadOnly?: boolean;
}

/**
 * Shipping method selection component
 * Allows users to select their preferred shipping method
 */
const ShippingMethod: React.FC<ShippingMethodProps> = ({ isReadOnly = false }) => {
  const {
    availableShippingMethods: shippingMethods,
    shippingMethodsLoading: loading,
    shippingMethod,
    submitShippingMethod,
  } = useCheckout();

  const { form } = useValidator('ShippingValidationService', shippingMethod, 'onChange', (data) => {
    const option = shippingMethods.find((option) => option.id === data.methodId);
    if (option) {
      submitShippingMethod(option);
    }
  });
  const t = useTranslations('Checkout.shipping');
  useEffect(() => {
    if (!shippingMethods.find((option) => option.id === shippingMethod?.methodId)) {
      form.reset();
    }
  }, [shippingMethods, shippingMethod]);
  return (
    <FormProvider {...form}>
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">{t('shippingMethod')}</h2>
        {loading && (
          <div className="flex justify-center items-center py-8">
            <Spinner variant="md" loadingText={t('loading')} />
          </div>
        )}
        {!loading && shippingMethods.length === 0 && (
          <div className="py-4 text-center text-neutral-600">{t('noShippingMethodsAvailable')}</div>
        )}
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
                  {shippingMethods.map((method) => (
                    <FormItem className="flex items-center space-x-3 space-y-0 w-full" key={method.id}>
                      <div
                        className={`flex items-center w-full border rounded-md p-4 cursor-pointer transition-colors ${
                          shippingMethod?.methodId === method.id
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-neutral-200 hover:border-primary-300'
                        } ${isReadOnly ? 'opacity-75 pointer-events-none' : ''}`}
                      >
                        <FormControl>
                          <RadioGroupItem value={method.id} id={method.id} />
                        </FormControl>
                        <FormLabel className="w-full" htmlFor={method.id}>
                          <div className="flex items-start justify-between w-full">
                            <div className="flex items-center space-x-3">
                              <div
                                className={`flex items-center justify-center ${
                                  shippingMethod?.methodId === method.id ? 'border-primary-600' : 'border-neutral-300'
                                }`}
                              >
                                {shippingMethod?.methodId === method.id && (
                                  <div className="w-3 h-3 rounded-full bg-primary-600"></div>
                                )}
                              </div>
                              <div>
                                <h3 className="font-medium text-neutral-900">{method.name}</h3>
                                <p className="text-sm text-neutral-500">{method.description}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="font-medium">
                                {!method.cost
                                  ? t('freeShipping')
                                  : new Intl.NumberFormat('en-US', {
                                      style: 'currency',
                                      currency: method.cost.currency,
                                    }).format(method.cost.amount)}
                              </span>
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
