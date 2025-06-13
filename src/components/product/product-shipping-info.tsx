'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { LucideCheck, LucideMapPin, LucidePackage, LucideRefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { H2 } from '../ui/h';

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
  deliveryDays = [3, 5],
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
          <H2 variant="h6" className="font-medium text-neutral-700 mb-2">
            {t('deliveryDetails')}
          </H2>

          <div className="flex items-center gap-2 text-sm text-neutral-600 mb-2">
            <LucidePackage className="text-success-500" />
            <span>{t('deliverable', { min: deliveryDays[0], max: deliveryDays[1] })}</span>
          </div>

          {shippingCost > 0 ? (
            <div className="flex items-center gap-2 text-sm text-neutral-600 mb-2 ml-6">
              <span>
                {t('shipping')}: {shippingCost.toFixed(2)}
                {currency === 'EUR' ? ' €' : ` ${currency}`}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-success-600 font-medium mb-2 ml-6">
              <span>{t('freeShipping')}</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm text-neutral-600">
            <LucideMapPin className="text-primary" />
            <span>{t('canBeReserved', { location, postalCode })}</span>
          </div>
        </div>

        <div>
          <H2 variant="h6" className="font-medium text-neutral-700 mb-2">
            {t('yourUsps')}
          </H2>

          <div className="flex items-center gap-2 text-sm text-neutral-600 mb-2">
            <LucideCheck className="text-success-500" />
            <span>{t('warranty', { years: warrantyYears })}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-neutral-600">
            <LucideRefreshCw className="text-success-500" />
            <span>{t('returnRight', { days: returnDays })}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
