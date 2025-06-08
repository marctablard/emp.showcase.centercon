'use client';

import React, { useEffect } from 'react';
import { FormProvider } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';
import { useCheckout } from '@/hooks/checkout/useCheckout';
import { useShippingMethods } from '@/hooks/shipping/useShippingMethods';
import { useValidator } from '@/hooks/validation/useValidator';
import { Shipping } from '@/platform/services/model/checkout';
import type { ShippingMethod } from '@/platform/services/model/shipping';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';

interface ShippingMethodProps {
  isReadOnly?: boolean;
}

/**
 * Shipping method selection component
 * Allows users to select their preferred shipping method
 */
const ShippingMethod: React.FC<ShippingMethodProps> = ({ isReadOnly = false }) => {
  const { shippingMethod, submitShippingMethod, shippingAddress } = useCheckout();
  const { shippingMethods, loading, fetchShippingMethods } = useShippingMethods();
  const { form } = useValidator('ShippingValidationService', shippingMethod, 'onChange');
  const t = useTranslations('Checkout');

  // Fetch shipping methods when the component mounts if we have an address
  useEffect(() => {
    if (shippingAddress?.country && shippingAddress?.zipCode) {
      fetchShippingMethods(shippingAddress.country, shippingAddress.zipCode);
    }
  }, [shippingAddress, fetchShippingMethods]);

  // If we have methods and none is selected yet, select the first one
  useEffect(() => {
    if (shippingMethods.length > 0 && !shippingMethod) {
      const defaultMethod = shippingMethods[0];
      submitShippingMethod({
        methodId: defaultMethod.id,
        methodName: defaultMethod.name,
        amount: defaultMethod.cost,
        zoneId: defaultMethod.zoneId,
      });
    }
  }, [shippingMethods, shippingMethod, submitShippingMethod]);

  const formState = form.formState;
  // Effect to auto-submit when all fields are valid and touched
  useEffect(() => {
    if (!formState.isValidating && formState.isValid) {
      const values = form.getValues() as Shipping;
      const option = shippingMethods.find((option) => option.id === values.methodId);
      if (option) {
        submitShippingMethod({
          methodId: option.id,
          methodName: option.name,
          amount: option.cost,
          zoneId: option.zoneId,
        });
      }
    }
  });

  return (
    <FormProvider {...form}>
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">{t('shippingMethod')}</h2>
        {loading && (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
            <span className="ml-2 text-neutral-600">{t('loadingShippingMethods')}</span>
          </div>
        )}
        {!loading && shippingMethods.length === 0 && (
          <div className="py-4 text-center text-neutral-600">
            {shippingAddress ? t('noShippingMethodsAvailable') : t('enterShippingAddressFirst')}
          </div>
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
                                {method.cost === 0
                                  ? t('freeShipping')
                                  : new Intl.NumberFormat('en-US', {
                                      style: 'currency',
                                      currency: method.currency || 'USD',
                                    }).format(method.cost)}
                              </span>
                              <p className="text-xs text-neutral-500">
                                {method.estimatedDelivery || t('estimatedDelivery')}
                              </p>
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
