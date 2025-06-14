'use client';

import React from 'react';
import { ProductPrice } from '@/platform/services/model/price';

interface ProductPriceProps {
  price: ProductPrice;
}

export function ProductPriceComponent({ price }: ProductPriceProps) {
  return (
    <div className="mt-4">
      <h2 className="text-3xl font-bold text-neutral-900">
        ${Math.floor(price.effectiveValue)}
        <span className="text-lg align-top">.{(price.effectiveValue % 1).toFixed(2).substring(2)}</span>
      </h2>
      {price.tierValues?.length > 0 && (
        <div className="mt-2 space-y-2">
          {price.tierValues.map((tier, index) => (
            <div key={index} className="flex items-center text-sm text-neutral-500">
              <span className="font-medium mr-2">{tier.minQuantity}+</span>
              <span>${tier.price.toFixed(2)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
