'use client';

import { Control } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

interface AccountSettingsAccordionProps {
  control: Control<any>;
}

export function AccountSettingsAccordion({ control }: AccountSettingsAccordionProps) {
  const t = useTranslations('register');

  return (
    <AccordionItem value="account-settings">
      <AccordionTrigger>
        <p className="text-base">{t('accountSettings')}</p>
      </AccordionTrigger>
      <AccordionContent>
        <div className="flex flex-col gap-4 mb-4">
          <p className="text-slate-600 text-sm">{t('accountDetails')}</p>
          <hr />
        </div>
        <div className="space-y-4">
          <FormField
            control={control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="username">{t('username')}</FormLabel>
                <FormControl>
                  <Input id="username" type="text" required {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
      </AccordionContent>
    </AccordionItem>
  );
}
