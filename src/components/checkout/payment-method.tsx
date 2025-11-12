'use client';

import React, { useState } from 'react';
import { FormProvider } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { ReceiptText } from 'lucide-react';
import { useCheckout } from '@/hooks/checkout/useCheckout';
import { useSite } from '@/hooks/site/useSite';
import { useValidator } from '@/hooks/validation/useValidator';
import { cn } from '@/lib/utils';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Spinner } from '../ui/spinner';

interface PaymentMethodProps {
  isReadOnly?: boolean;
}

/**
 * Payment method selection component for checkout
 */
const PaymentMethodComponent: React.FC<PaymentMethodProps> = ({ isReadOnly = false }) => {
  const { paymentMethod, submitPaymentMethod } = useCheckout();
  const { paymentModes, loading, error } = useSite();
  const { form } = useValidator('PaymentValidationService', paymentMethod, 'onChange', (value) => {
    const mode = paymentModes?.find((mode) => mode.id === value.id);
    if (mode) {
      // TODO handle Provider
      submitPaymentMethod({
        ...mode,
        provider: 'none',
      });
    }
  });

  const [cardDetails] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: '',
  });

  const t = useTranslations('checkout.payment');
  const tPayment = useTranslations('checkout.PaymentModes');

  return (
    <FormProvider {...form}>
      <div className="space-y-6 bg-white">
        {loading && <Spinner variant="md" loadingText={t('loading')} />}

        {error && <div className="py-4 text-center text-red-500">{t('errorLoadingPaymentMethods')}</div>}

        {!loading && !error && paymentModes?.length === 0 && (
          <div className="py-4 text-center text-neutral-600">{t('noPaymentMethodsAvailable')}</div>
        )}

        {!loading && !error && !isReadOnly ? (
          <FormField
            control={form.control}
            name="id"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <RadioGroup
                    defaultValue={field.value}
                    onValueChange={field.onChange}
                    className={cn('flex flex-col space-y-1')}
                  >
                    <div className="">
                      <div>
                        {paymentModes?.map((option) => (
                          <div key={option.id}>
                            <FormItem
                              className={cn(
                                'flex items-center border rounded-md p-4',
                                paymentMethod?.code === option.code && 'border-primary-500 bg-primary-50',
                              )}
                            >
                              <FormControl>
                                <RadioGroupItem value={option.id} id={option.code} />
                              </FormControl>
                              <FormLabel
                                htmlFor={option.code}
                                className="w-full ml-3 block text-sm font-medium text-neutral-700"
                              >
                                <div className=" flex justify-between">
                                  {tPayment(option.code)}
                                  {option.code === 'invoice' ? <ReceiptText /> : null}
                                </div>
                              </FormLabel>
                            </FormItem>
                          </div>
                        ))}
                      </div>

                      {/* Credit Card Form */}
                      {paymentMethod?.code === 'credit-card' && (
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
                      {paymentMethod?.code === 'paypal' && (
                        <div className="border-t p-4">
                          <p className="text-sm text-neutral-600">{t('paypalRedirect')}</p>
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
            <p className="font-medium">{tPayment(paymentMethod?.code ?? 'none')}</p>

            {paymentMethod?.code === 'credit-card' && paymentMethod?.customAttributes?.cardNumber && (
              <p className="text-sm text-neutral-600 mt-1">
                {t('cardEndingIn')} {paymentMethod.customAttributes.cardNumber.slice(-4)}
              </p>
            )}
          </div>
        )}
      </div>
      <div className="pt-4">
        <FormField
          control={form.control}
          name="companyName"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="companyName">{t('additionalInvoice')}</FormLabel>
              <FormControl>
                <Input id="additionalInvoice" type="text" placeholder="Email" {...field} disabled={isReadOnly} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </FormProvider>
  );
};

export default PaymentMethodComponent;
