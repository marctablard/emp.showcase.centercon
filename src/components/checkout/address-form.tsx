'use client';

import React from 'react';
import { FormProvider, UseFormReturn, useForm } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';
import { CheckoutAddress } from '@/platform/services/model/checkout';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface AddressFormProps {
  initialData?: Partial<Omit<CheckoutAddress, 'type'>>;
  onDataChange: (data: Omit<CheckoutAddress, 'type'>) => void;
  isReadOnly?: boolean;
}

/**
 * Reusable address form component for checkout
 * Can be used for both shipping and billing addresses
 */
const AddressForm: React.FC<AddressFormProps> = ({ isReadOnly = false, initialData, onDataChange }) => {
  const t = useTranslations('Checkout');
  const AddressFormSchema = z.object({
    contactName: z.string().min(1, { message: t('validation.fullNameRequired') }),
    street: z.string().min(1, { message: t('validation.streetRequired') }),
    streetNumber: z.string().min(1, { message: t('validation.houseNumberRequired') }),
    zipCode: z.string().min(1, { message: t('validation.postalCodeRequired') }),
    city: z.string().min(1, { message: t('validation.cityRequired') }),
    country: z.string().min(1, { message: t('validation.countryRequired') }),
    state: z.string().optional(),
    phoneNumber: z.string().optional(),
    companyName: z.string().optional(),
  });

  const form = useForm<z.infer<typeof AddressFormSchema>>({
    resolver: zodResolver(AddressFormSchema),
    defaultValues: initialData,
  });

  // Watch form state to detect when all fields are valid
  const formState = form.formState;

  const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (formState.isValid) {
      form.handleSubmit(onSubmit)(e);
    }
  };

  const onSubmit = (data: z.infer<typeof AddressFormSchema>) => {
    onDataChange(data);
  };

  // Common countries list - can be expanded or fetched from an API
  const countries = [
    { code: 'US', name: 'United States' },
    { code: 'CA', name: 'Canada' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'DE', name: 'Germany' },
    { code: 'FR', name: 'France' },
    { code: 'ES', name: 'Spain' },
    { code: 'IT', name: 'Italy' },
    { code: 'JP', name: 'Japan' },
    { code: 'AU', name: 'Australia' },
  ];

  return (
    <FormProvider {...form}>
      <div className="space-y-4">
        <div>
          <FormField
            control={form.control}
            name="contactName"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="fullName">{t('fullName')}*</FormLabel>
                <FormControl onBlur={onBlur}>
                  <Input id="fullName" type="text" {...field} disabled={isReadOnly} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <FormField
              control={form.control}
              name="street"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="street">{t('street')}*</FormLabel>
                  <FormControl onBlur={onBlur}>
                    <Input id="street" type="text" {...field} disabled={isReadOnly} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div>
            <div className="md:col-span-2">
              <FormField
                control={form.control}
                name="streetNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="streetNumber">{t('streetNumber')}</FormLabel>
                    <FormControl onBlur={onBlur}>
                      <Input id="streetNumber" type="text" {...field} disabled={isReadOnly} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <FormField
              control={form.control}
              name="zipCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="zipCode">{t('zipCode')}*</FormLabel>
                  <FormControl onBlur={onBlur}>
                    <Input id="zipCode" type="text" {...field} disabled={isReadOnly} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="md:col-span-2">
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="city">{t('city')}*</FormLabel>
                  <FormControl onBlur={onBlur}>
                    <Input id="city" type="text" {...field} disabled={isReadOnly} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('country')}*</FormLabel>
                  <FormControl onBlur={onBlur}>
                    <Select onValueChange={field.onChange}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Theme" />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country.code} value={country.code}>
                            {country.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div>
            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="state">{t('state')}</FormLabel>
                  <FormControl onBlur={onBlur}>
                    <Input id="state" type="text" {...field} disabled={isReadOnly} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div>
          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="phoneNumber">{t('phoneNumber')}</FormLabel>
                <FormControl onBlur={onBlur}>
                  <Input id="phoneNumber" type="text" {...field} disabled={isReadOnly} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div>
          <FormField
            control={form.control}
            name="companyName"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="companyName">{t('companyName')}</FormLabel>
                <FormControl onBlur={onBlur}>
                  <Input id="companyName" type="text" {...field} disabled={isReadOnly} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </FormProvider>
  );
};

export default AddressForm;
