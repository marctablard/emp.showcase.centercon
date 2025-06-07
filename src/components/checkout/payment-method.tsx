'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useCheckout } from '@/hooks/checkout/useCheckout';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { useValidator } from '@/hooks/validation/useValidator';
import { FormProvider } from 'react-hook-form';
import { usePaymentModes } from '@/hooks/payment/usePaymentModes';
import { Loader2 } from 'lucide-react';

interface PaymentMethodProps {
  isReadOnly?: boolean;
}

/**
 * Payment method selection component for checkout
 */
const PaymentMethodComponent: React.FC<PaymentMethodProps> = ({ isReadOnly = false }) => {
  const { paymentMethod, submitPaymentMethod } = useCheckout();
  const { form } = useValidator(
    'PaymentValidationService',
    paymentMethod,
    'onChange'
  );
  const { paymentModes, loading, error, fetchPaymentModes } = usePaymentModes();
  
  // Transform API payment modes to UI payment options
  const paymentOptions = paymentModes
    .filter(mode => mode.active)
    .map(mode => ({
      id: mode.code, // Use code as ID since it's more reliable
      code: mode.code,
      name: mode.name || mode.code,
      provider: mode.provider,
      method: mode.code
    }));

  const [cardDetails] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: '',
  });

  const t = useTranslations('Checkout');
  
  // Fetch payment modes when component mounts
  useEffect(() => {
    fetchPaymentModes();
  }, [fetchPaymentModes]);

  const formState = form.formState;
  // Effect to auto-submit when all fields are valid and touched
  useEffect(() => {
    if (!formState.isValidating && formState.isValid) {
      submitPaymentMethod(form.getValues());
    }
  }, [formState.isValidating, formState.isValid, submitPaymentMethod, form]);

  return (
    <FormProvider {...form}>
      <div className="space-y-6 bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold text-neutral-800">{t('paymentMethod')}</h2>
        
        {loading && (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
            <span className="ml-2 text-neutral-600">{t('loadingPaymentMethods')}</span>
          </div>
        )}
        
        {error && (
          <div className="py-4 text-center text-red-500">
            {t('errorLoadingPaymentMethods')}
          </div>
        )}
        
        {!loading && !error && paymentOptions.length === 0 && (
          <div className="py-4 text-center text-neutral-600">
            {t('noPaymentMethodsAvailable')}
          </div>
        )}
        
        {!loading && !error && paymentOptions.length > 0 && !isReadOnly ? (
          <FormField
            control={form.control}
            name="method"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <RadioGroup defaultValue={field.value} onValueChange={field.onChange} className="flex flex-col space-y-1">
                    <div className="space-y-6">
                      <div className="space-y-4">
                        {paymentOptions.map((option) => (
                          <div key={option.id}>
                            <FormItem className="flex items-center">
                              <FormControl>
                                <RadioGroupItem value={option.id} id={option.id} />
                              </FormControl>
                              <FormLabel
                                htmlFor={option.id}
                                className="w-full ml-3 block text-sm font-medium text-neutral-700"
                              >
                                {option.name}
                              </FormLabel>
                            </FormItem>
                          </div>
                        ))}
                      </div>

                      {/* Credit Card Form */}
                      {paymentMethod?.method === 'credit-card' && (
                        <div className="mt-6 space-y-4 border-t pt-4">
                          <div>
                            <label htmlFor="cardNumber" className="block text-sm font-medium text-neutral-700 mb-1">
                              {t('cardNumber')}
                            </label>
                            <input
                              type="text"
                              id="cardNumber"
                              name="cardNumber"
                              value={cardDetails.cardNumber}
                              className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                              placeholder="1234 5678 9012 3456"
                            />
                          </div>

                          <div>
                            <label htmlFor="cardHolder" className="block text-sm font-medium text-neutral-700 mb-1">
                              {t('cardHolder')}
                            </label>
                            <input
                              type="text"
                              id="cardHolder"
                              name="cardHolder"
                              value={cardDetails.cardHolder}
                              className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                              placeholder="John Doe"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label htmlFor="expiryDate" className="block text-sm font-medium text-neutral-700 mb-1">
                                {t('expiryDate')}
                              </label>
                              <input
                                type="text"
                                id="expiryDate"
                                name="expiryDate"
                                value={cardDetails.expiryDate}
                                className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                                placeholder="MM/YY"
                              />
                            </div>

                            <div>
                              <label htmlFor="cvv" className="block text-sm font-medium text-neutral-700 mb-1">
                                {t('cvv')}
                              </label>
                              <input
                                type="text"
                                id="cvv"
                                name="cvv"
                                value={cardDetails.cvv}
                                className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                                placeholder="123"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* PayPal Form */}
                      {paymentMethod?.method === 'paypal' && (
                        <div className="mt-6 border-t pt-4">
                          <p className="text-sm text-neutral-600">{t('paypalRedirect')}</p>
                        </div>
                      )}

                      {/* Invoice Form */}
                      {paymentMethod?.method === 'invoice' && (
                        <div className="mt-6 border-t pt-4">
                          <p className="text-sm text-neutral-600">{t('invoiceTerms')}</p>
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
          <div className="text-neutral-700">
            <p className="font-medium">
              {paymentOptions.find((option) => option.method === paymentMethod?.method)?.name ||
                t('selectedPaymentMethod')}
            </p>

            {paymentMethod?.method === 'credit-card' && paymentMethod?.customAttributes?.cardNumber && (
              <p className="text-sm text-neutral-600 mt-1">
                {t('cardEndingIn')} {paymentMethod.customAttributes.cardNumber.slice(-4)}
              </p>
            )}
          </div>
        )}
      </div>
    </FormProvider>
  );
};

export default PaymentMethodComponent;
