'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { isEqual, omit } from 'lodash';
import AddressForm from '@/components/common/address-form';
import { Address } from '@/platform/services/model/common';

interface CheckoutAddressProps {
  address?: Address | null;
  addressLabel: string;
  isReadOnly?: boolean;
  sameAs?: {
    referenceAddress: Address;
    label: string;
    id: string;
  };
  onAddressChange?: (address: Address) => void;
}

/**
 * Addresses component for checkout
 * Manages both shipping and billing addresses with option to use same address for both
 */
const CheckoutAddress: React.FC<CheckoutAddressProps> = ({ address, isReadOnly = false, sameAs, onAddressChange }) => {
  // Determine if billing is same as shipping based on actual address comparison
  const initialSameState = useMemo(() => {
    if (!sameAs) return false;
    return isEqual(omit(address, 'type'), omit(sameAs.referenceAddress, 'type'));
  }, [address, sameAs]);

  const [isSame, setIsSame] = useState<boolean>(initialSameState);

  useEffect(() => {
    if (!sameAs || !address) return;
    setIsSame(initialSameState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, sameAs]);

  const handleSameAddressToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    setIsSame(isChecked);
    if (sameAs && onAddressChange) {
      onAddressChange(sameAs.referenceAddress);
    }
  };

  return (
    <div className="space-y-8 bg-white pb-6 border-b border-neutral-200">
      {/* Same as ... checkbox */}
      {sameAs && (
        <div className="flex items-center">
          <input
            type="checkbox"
            id={sameAs.id}
            checked={isSame}
            onChange={handleSameAddressToggle}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
          />
          <label htmlFor={sameAs.id} className="ml-2 block text-sm text-neutral-700">
            {sameAs.label}
          </label>
        </div>
      )}

      {/* Address Input (only shown if not same as referenceAddress) */}
      {!isSame && (
        <div>
          <AddressForm initialData={address} onDataChange={onAddressChange} isReadOnly={isReadOnly} />
        </div>
      )}
    </div>
  );
};

export default CheckoutAddress;
