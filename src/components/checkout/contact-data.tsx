'use client';

import React, { useEffect } from 'react';
import { FormProvider } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { useCheckout } from '@/hooks/checkout/useCheckout';
import { ContactData } from '@/platform/services/model/checkout';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import { useValidator } from '@/hooks/validation/useValidator';

interface ContactDataProps {
  initialData?: Partial<ContactData>;
  isReadOnly?: boolean;
}

/**
 * Customer data form component for checkout
 * Collects basic customer information (email, name)
 */
const ContactDataComponent: React.FC<ContactDataProps> = ({ isReadOnly = false, initialData = undefined }) => {
  const t = useTranslations('Checkout');
  const { submitContactData, contactData } = useCheckout();

  const { form } = useValidator(
    'ContactDataValidationService',
    initialData || contactData,
    'onBlur'
  );

  // Watch form state to detect when all fields are valid
  const formState = form.formState;
  useEffect(() => {
    if (!formState.isValidating && formState.isValid) {
      submitContactData(form.getValues());
    }
  }, [formState.isValidating, formState.isValid]);

  return (
    <FormProvider {...form}>
      <div className="space-y-6 bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold text-neutral-800">{t('contactInformation')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="email">{t('emailAddress')}*</FormLabel>
                <FormControl>
                  <Input id="email" type="text" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="phone">{t('phoneNumber')}</FormLabel>
                <FormControl>
                  <Input id="phone" type="text" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="firstName">{t('firstName')}*</FormLabel>
                <FormControl>
                  <Input id="firstName" type="text" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="lastName">{t('lastName')}*</FormLabel>
                <FormControl>
                  <Input id="lastName" type="text" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="company"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="email">{t('companyName')}</FormLabel>
                <FormControl>
                  <Input id="company" type="text" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {isReadOnly && (
          <div className="mt-4 text-right">
            <button
              type="button"
              className="text-primary-600 hover:text-primary-800"
              onClick={() => {
                /* Add edit functionality here */
              }}
            >
              Edit
            </button>
          </div>
        )}
      </div>
    </FormProvider>
  );
};

export default ContactDataComponent;
