'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { LucideCheck, LucideMapPin, LucidePackage, LucideRefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ProductShippingInfoProps {
  className?: string;
  deliveryDays?: [number, number]; // [min, max] days
  shippingCost?: number;
  currency?: string;
  location?: string;
  postalCode?: string;
  warrantyYears?: number;
  returnDays?: number;
}

export function ProductShippingInfo({
  className,
  deliveryDays = [1, 3],
  shippingCost = 9.95,
  currency = 'EUR',
  location = 'London',
  postalCode = 'NW1 6XE',
  warrantyYears = 5,
  returnDays = 30,
}: ProductShippingInfoProps) {
  const t = useTranslations('product.shipping');

  return (
    <Card variant="gray" className={cn('mt-6', className)}>
      <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h2 className="font-headlines font-bold text-neutral text-md mb-4">{t('deliveryDetails')}</h2>

          <div className="flex items-center gap-2 text-sm text-neutral mb-2">
            <LucidePackage className="text-success-500" />
            <span>{t('deliverable', { min: deliveryDays[0], max: deliveryDays[1] })}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-neutral mb-2 ml-8">
            {shippingCost > 0 ? (
              <span>
                {t('shipping')}: {shippingCost.toFixed(2)}
                {currency === 'EUR' ? ' €' : ` ${currency}`}
              </span>
            ) : (
              <span className="ml-4">{t('freeShipping')}</span>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-neutral">
            <LucideMapPin className="text-success-500" />
            <span>{t('canBeReserved', { location, postalCode })}</span>
          </div>
        </div>

        <div>
          <h2 className="font-headlines font-bold text-neutral text-md mb-4">{t('yourUsps')}</h2>

          <div className="flex items-center gap-2 text-sm text-neutral mb-2">
            <LucideCheck className="text-success-500" />
            <span>{t('warranty', { years: warrantyYears })}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-neutral">
            <LucideRefreshCw className="text-success-500" />
            <span>{t('returnRight', { days: returnDays })}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
