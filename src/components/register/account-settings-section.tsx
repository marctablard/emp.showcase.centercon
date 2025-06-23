'use client';

import { Control } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { H5 } from '@/components/ui/h';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

interface AccountSettingsAccordionProps {
  control: Control<any>;
  number: number;
}

export function AccountSettingsSection({ control, number }: AccountSettingsAccordionProps) {
  const t = useTranslations('register');

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <H5>
          {number}. {t('accountSettings')}
        </H5>
        <Separator />
      </div>
      <div className="space-y-4">
        <FormField
          control={control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="password">{t('password')}</FormLabel>
              <FormControl>
                <Input id="password" type="password" required {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="passwordConfirmation"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="passwordConfirmation">{t('passwordConfirmation')}</FormLabel>
              <FormControl>
                <Input id="passwordConfirmation" type="password" required {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
