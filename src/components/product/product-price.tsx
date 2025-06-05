'use client';

import React from 'react';

interface PriceTier {
  quantity: number;
  price: number;
}

interface ProductPriceProps {
  price: number;
  tiers: PriceTier[];
}

export function ProductPriceComponent({ price, tiers }: ProductPriceProps) {
  return (
    <div className="mt-4">
      <h2 className="text-3xl font-bold text-neutral-900">
        ${Math.floor(price)}
        <span className="text-lg align-top">.{(price % 1).toFixed(2).substring(2)}</span>
      </h2>
      <div className="mt-2 space-y-2">
        {tiers.map((tier, index) => (
          <div key={index} className="flex items-center text-sm text-neutral-500">
            <span className="font-medium mr-2">{tier.quantity}+</span>
            <span>${tier.price.toFixed(2)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
