'use client';

import { useEffect } from 'react';
import { Control } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSite } from '@/hooks/site/useSite';
import { useL10n } from '@/hooks/useL10n';
import { Spinner } from '../ui/spinner';

import { useEffect } from 'react';

interface AddressInfoAccordionProps {
  control: Control<any>;
}

export function AddressInfoAccordion({ control }: AddressInfoAccordionProps) {
  const { loading, countries, fetchSiteData } = useSite();
  const { l10n } = useL10n();
  const t = useTranslations('register');

  useEffect(() => {
    if (!countries) {
      fetchSiteData();
    }
  }, [fetchSiteData, countries]);

  if (loading) {
    return <Spinner />;
  }

  return (
    <AccordionItem value="address-info">
      <AccordionTrigger>
        <p className="text-base">{t('addressInfo')}</p>
      </AccordionTrigger>
      <AccordionContent>
        <div className="flex flex-col gap-4 mb-4">
          <p className="text-slate-600 text-sm">{t('addressDetails')}</p>
          <hr />
        </div>
        <div className="space-y-4">
          <FormField
            control={control}
            name="companyName"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="companyName">{t('companyName')}</FormLabel>
                <FormControl>
                  <Input id="companyName" type="text" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/*}
                    <FormField
                        control={control}
                        name="businessType"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel htmlFor="businessType">{t('businessType')}</FormLabel>
                                <FormControl>
                                    <Input id="businessType" type="text" {...field}/>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    {*/}
          <FormField
            control={control}
            name="street"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="street">{t('street')}</FormLabel>
                <FormControl>
                  <Input id="street" type="text" required {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="houseNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="houseNumber">{t('houseNumber')}</FormLabel>
                <FormControl>
                  <Input id="houseNumber" type="text" required {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="postalCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="postalCode">{t('postalCode')}</FormLabel>
                <FormControl>
                  <Input id="postalCode" type="text" required {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="city">{t('city')}</FormLabel>
                <FormControl>
                  <Input id="city" type="text" required {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="country">{t('country')}</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder={t('country')} />
                    </SelectTrigger>
                    <SelectContent>
                      {countries?.map((country) => (
                        <SelectItem key={country.code} value={country.code}>
                          {l10n(country.name)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="vatNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="vatNumber">{t('vatNumber')}</FormLabel>
                <FormControl>
                  <Input id="vatNumber" type="text" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="shippingSameAsBilling"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center gap-2">
                <FormControl>
                  <Checkbox id="shippingSameAsBilling" checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel htmlFor="shippingSameAsBilling">{t('shippingSameAsBilling')}</FormLabel>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
