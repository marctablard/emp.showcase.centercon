'use client';

import React, { useEffect } from 'react';
import { FormProvider, UseFormReturn, useForm, useWatch } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import z, { isValid } from 'zod';
import { useCheckout } from '@/hooks/checkout/useCheckout';
import { ContactData, Customer } from '@/platform/services/model/checkout';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Input } from '../ui/input';

interface CustomerDataProps {
  initialData?: Partial<Customer>;
  isReadOnly?: boolean;
}

/**
 * Customer data form component for checkout
 * Collects basic customer information (email, name)
 */
const ContactDataComponent: React.FC<CustomerDataProps> = ({ isReadOnly = false, initialData = undefined }) => {
  const t = useTranslations('Checkout');
  const { submitContactData, contactData } = useCheckout();

  const ContactDataFormSchema = z.object({
    email: z
      .string()
      .min(1, { message: t('validation.emailRequired') })
      .email({ message: t('validation.invalidEmail') }),
    phone: z.string().min(1, { message: t('validation.phoneRequired') }),
    firstName: z.string().min(1, { message: t('validation.firstNameRequired') }),
    lastName: z.string().min(1, { message: t('validation.lastNameRequired') }),
    company: z.string().optional(),
  });
  const form = useForm<z.infer<typeof ContactDataFormSchema>>({
    resolver: zodResolver(ContactDataFormSchema),
    defaultValues: {
      email: contactData?.email || initialData?.email,
      phone: contactData?.phone || initialData?.phone,
      firstName: contactData?.firstName || initialData?.firstName,
      lastName: contactData?.lastName || initialData?.lastName,
      company: contactData?.company || initialData?.company,
    },
    mode: 'onBlur',
  });

  // Watch form state to detect when all fields are valid
  const formState = form.formState;

  const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (formState.isValid) {
      form.handleSubmit(onSubmit)(e);
    }
  };

  const onSubmit = (data: z.infer<typeof ContactDataFormSchema>) => {
    const contactData: ContactData = {
      email: data.email,
      phone: data.phone,
      firstName: data.firstName,
      lastName: data.lastName,
      company: data.company,
    };
    toast(JSON.stringify(contactData));
    submitContactData(contactData);
  };

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
                <FormControl onBlur={onBlur}>
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
                <FormControl onBlur={onBlur}>
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
                <FormControl onBlur={onBlur}>
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
                <FormControl onBlur={onBlur}>
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
                <FormControl onBlur={onBlur}>
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
