'use client';

import { Control } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { H5 } from '@/components/ui/h';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';

interface RegistrationInfoAccordionProps {
  control: Control<any>;
  number: number;
}

export function RegistrationInfoSection({ control, number }: RegistrationInfoAccordionProps) {
  const t = useTranslations('register');

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <H5>
          {number}. {t('registrationInfo')}
        </H5>
        <Separator />
      </div>
      <div className="space-y-4">
        <FormField
          control={control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="firstName">{t('firstName')}</FormLabel>
              <FormControl>
                <Input id="firstName" type="text" required {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="lastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="lastName">{t('lastName')}</FormLabel>
              <FormControl>
                <Input id="lastName" type="text" required {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="email">{t('email')}</FormLabel>
              <FormControl>
                <Input id="email" type="email" required {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="emailConfirmation"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="emailConfirmation">{t('emailConfirmation')}</FormLabel>
              <FormControl>
                <Input id="emailConfirmation" type="email" required {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="businessType"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="businessType">{t('businessType')}</FormLabel>
              <FormControl>
                <RadioGroup id="businessType" className="flex my-4" value={field.value} onValueChange={field.onChange}>
                  <FormItem className="flex">
                    <FormControl>
                      <RadioGroupItem value="B2B" id="B2B" />
                    </FormControl>
                    <FormLabel className="w-full ml-2" htmlFor="B2B">
                      {t('businessTypeB2B')}
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex">
                    <FormControl>
                      <RadioGroupItem value="B2C" id="B2C" />
                    </FormControl>
                    <FormLabel className="w-full" htmlFor="B2C">
                      {t('businessTypeB2C')}
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
