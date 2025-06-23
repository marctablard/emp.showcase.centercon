'use client';

import { useEffect } from 'react';
import { Control } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { Checkbox } from '@/components/ui/checkbox';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { H5 } from '@/components/ui/h';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import { useSite } from '@/hooks/site/useSite';
import { useL10n } from '@/hooks/useL10n';

interface AddressInfoAccordionProps {
  control: Control<any>;
  number: number;
}

export function AddressInfoSection({ control, number }: AddressInfoAccordionProps) {
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
    <div className="space-y-6">
      <div className="space-y-2">
        <H5>
          {number}. {t('addressInfo')}
        </H5>
        <Separator />
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
        <div className="flex gap-6">
          <FormField
            control={control}
            name="street"
            render={({ field }) => (
              <FormItem className="w-2/3 md:w-3/4">
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
              <FormItem className="w-1/3 md:w-1/4">
                <FormLabel htmlFor="houseNumber">{t('houseNumber')}</FormLabel>
                <FormControl>
                  <Input id="houseNumber" type="text" required {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex gap-6">
          <FormField
            control={control}
            name="postalCode"
            render={({ field }) => (
              <FormItem className="w-1/3 md:w-1/4">
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
              <FormItem className="w-2/3 md:w-3/4">
                <FormLabel htmlFor="city">{t('city')}</FormLabel>
                <FormControl>
                  <Input id="city" type="text" required {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={control}
          name="country"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="country">{t('country')}</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger>
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
    </div>
  );
}
