'use client';

import React from 'react';
import { FormProvider } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { Info } from 'lucide-react';
import { useCheckout } from '@/hooks/checkout/useCheckout';
import { useValidator } from '@/hooks/validation/useValidator';
import type { ShippingMethod } from '@/platform/services/model/shipping';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Spinner } from '../ui/spinner';

interface ShippingMethodProps {
  isReadOnly?: boolean;
  variant?: 'default' | 'slim';
}

/**
 * Shipping method selection component
 * Allows users to select their preferred shipping method
 */
const ShippingMethod: React.FC<ShippingMethodProps> = ({ isReadOnly = false, variant = 'default' }) => {
  const {
    availableShippingMethods: shippingMethods,
    shippingMethodsLoading: loading,
    shippingMethod,
    submitShippingMethod,
  } = useCheckout();

  const { form } = useValidator('ShippingValidationService', shippingMethod, 'onChange', (data) => {
    const option = shippingMethods?.find((option) => option.id === data.methodId);
    if (option) {
      submitShippingMethod(option);
    }
  });
  const t = useTranslations('checkout.shipping');
  return (
    <FormProvider {...form}>
      <div className="bg-white">
        <h2 className="font-bold text-neutral-900 mb-2">{t('shippingMethod')}</h2>
        <div className="flex gap-2 items-center text-primary-500 mb-4">
          <Info className="w-4 h-4" />
          <p className="text-xs">{t('multiplePackages')}</p>
        </div>
        {loading && (
          <div className="flex justify-center items-center py-8">
            <Spinner variant="md" loadingText={t('loading')} />
          </div>
        )}
        {!loading && (!shippingMethods || shippingMethods.length === 0) && (
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
                  {shippingMethods!.map((method) => (
                    <FormItem
                      className={
                        variant === 'default'
                          ? 'flex items-center space-x-3 space-y-0 w-full'
                          : 'flex items-center space-y-0 w-full'
                      }
                      key={method.id}
                    >
                      <div
                        className={
                          variant === 'default'
                            ? `flex items-center w-full border rounded-md p-4 cursor-pointer transition-colors ${
                                shippingMethod?.methodId === method.id
                                  ? 'border-primary-500 bg-primary-50'
                                  : 'border-neutral-200 hover:border-primary-300'
                              } ${isReadOnly ? 'opacity-75 pointer-events-none' : ''}`
                            : `flex items-center w-full cursor-pointer transition-colors ${
                                shippingMethod?.methodId === method.id
                                  ? 'border-primary-500'
                                  : 'border-neutral-200 hover:border-primary-300'
                              } ${isReadOnly ? 'opacity-75 pointer-events-none' : ''}`
                        }
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
                              ></div>
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
