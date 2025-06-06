'use client';

import React, { useEffect } from 'react';
import { FormProvider } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { CheckoutAddress } from '@/platform/services/model/checkout';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useValidator } from '@/hooks/validation/useValidator';

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

    const { form } = useValidator(
      'AddressValidationService',
      initialData,
      'onBlur'
    );
  
    // Watch form state to detect when all fields are valid
    const formState = form.formState;
    useEffect(() => {
      if (!formState.isValidating && formState.isValid) {
        onDataChange(form.getValues());
      }
    }, [formState.isValidating, formState.isValid]);
  

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
                <FormLabel htmlFor="contactName">{t('fullName')}*</FormLabel>
                <FormControl>
                  <Input id="contactName" type="text" {...field} disabled={isReadOnly} />
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
                  <FormControl>
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
                    <FormControl>
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
                  <FormControl>
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
                  <FormControl>
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
                  <FormControl>
                    {/*trigger field change AND form validation */}
                    <Select onValueChange={(e) => {field.onChange(e); field.onBlur()}} defaultValue={field.value}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder={t('country')} />
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
                  <FormControl>
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
                <FormControl>
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
                <FormControl>
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
