'use client';

import React from 'react';
import { formatCurrency } from '@/lib/utils';
import { Price } from '@/platform/services/model/common';

interface ProductPriceProps {
  price: Price;
}

export function ProductPriceComponent({ price }: ProductPriceProps) {
  return (
    <div className="mt-4">
      <h2 className="text-3xl font-bold text-neutral-900">{formatCurrency(price.amount, price.currency)}</h2>
      {price.tiers && (
        <div className="mt-2 space-y-2">
          {price.tiers.map((tier, index) => (
            <div key={index} className="flex items-center text-sm text-neutral-500">
              <span className="font-medium mr-2">{tier.quantity}+</span>
              <span>{formatCurrency(tier.amount, price.currency)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
