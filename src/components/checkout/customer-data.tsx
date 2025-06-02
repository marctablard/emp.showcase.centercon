'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { Customer } from '@/platform/services/model/checkout';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Input } from '../ui/input';

interface CustomerDataProps {
  initialData?: Partial<Customer>;
  isReadOnly?: boolean;
  form: UseFormReturn<any>;
}

/**
 * Customer data form component for checkout
 * Collects basic customer information (email, name)
 */
const ContactDataComponent: React.FC<CustomerDataProps> = ({ isReadOnly = false, form }) => {
  const t = useTranslations('Checkout');

  return (
    <div className="space-y-6 bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold text-gray-800">{t('contactInformation')}</h2>
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
            className="text-indigo-600 hover:text-indigo-800"
            onClick={() => {
              /* Add edit functionality here */
            }}
          >
            Edit
          </button>
        </div>
      )}
    </div>
  );
};

export default ContactDataComponent;
