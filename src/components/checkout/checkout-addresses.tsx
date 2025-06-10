'use client';

import React, { useMemo, useState } from 'react';
import { isEqual, omit } from 'lodash';
import { useCheckout } from '@/hooks/checkout/useCheckout';
import { CheckoutAddress } from '@/platform/services/model/checkout';
import AddressForm from './address-form';

interface AddressesProps {
  isReadOnly?: boolean;
}

/**
 * Addresses component for checkout
 * Manages both shipping and billing addresses with option to use same address for both
 */
const Addresses: React.FC<AddressesProps> = ({ isReadOnly = false }) => {
  const {
    submitShippingAddress,
    submitBillingAddress,
    shippingAddress: storeShippingAddress,
    billingAddress: storeBillingAddress,
  } = useCheckout();

  const emptyAddress = {
    contactName: '',
    street: '',
    streetNumber: '',
    streetAppendix: '',
    zipCode: '',
    city: '',
    country: '',
    state: '',
    companyName: '',
    contactPhone: '',
  };
  const [shippingAddress, setShippingAddress] = useState<Omit<CheckoutAddress, 'type'>>({
    ...emptyAddress,
    ...storeShippingAddress,
  });

  const [billingAddress, setBillingAddress] = useState<Omit<CheckoutAddress, 'type'>>({
    ...emptyAddress,
    ...storeBillingAddress,
  });

  // Determine if billing is same as shipping based on actual address comparison
  const initialSameAsShipping = useMemo(() => {
    // If billing address is empty, default to true
    if (!storeBillingAddress || Object.keys(storeBillingAddress || {}).length === 0) return true;
    // If shipping address is empty, we can't compare (and the billing address is not empty, so we must show it)
    if (!storeShippingAddress) return false;
    // Compare the addresses
    return isEqual(omit(storeShippingAddress, 'type'), omit(storeBillingAddress, 'type'));
  }, [storeShippingAddress, storeBillingAddress]);

  const [sameAsShipping, setSameAsShipping] = useState<boolean>(initialSameAsShipping);

  const handleShippingAddressChange = (data: Omit<CheckoutAddress, 'type'>) => {
    setShippingAddress(data);
    submitShippingAddress({ ...data, type: 'SHIPPING' });
    // If same as shipping is checked, also update billing address
    if (sameAsShipping) {
      submitBillingAddress({ ...data, type: 'BILLING' });
    }
  };

  const handleBillingAddressChange = (data: Omit<CheckoutAddress, 'type'>) => {
    setBillingAddress(data);
    submitBillingAddress({ ...data, type: 'BILLING' });
  };

  const handleSameAddressToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    setSameAsShipping(isChecked);

    // If checked, update billing address to match shipping
    if (isChecked) {
      submitBillingAddress({ ...shippingAddress, type: 'BILLING' });
    }
  };

  return (
    <div className="space-y-8 bg-white p-6 rounded-lg shadow-sm">
      {/* Shipping Address */}
      <div>
        <h2 className="text-xl font-semibold text-neutral-800 mb-4">Shipping Address</h2>
        <AddressForm initialData={shippingAddress} onDataChange={handleShippingAddressChange} isReadOnly={isReadOnly} />
      </div>

      {/* Same as shipping checkbox */}
      {!isReadOnly && (
        <div className="flex items-center">
          <input
            type="checkbox"
            id="sameAsShipping"
            checked={sameAsShipping}
            onChange={handleSameAddressToggle}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
          />
          <label htmlFor="sameAsShipping" className="ml-2 block text-sm text-neutral-700">
            Billing address is the same as shipping address
          </label>
        </div>
      )}

      {/* Billing Address (only shown if not same as shipping) */}
      {!sameAsShipping && (
        <div>
          <h2 className="text-xl font-semibold text-neutral-800 mb-4">Billing Address</h2>
          <AddressForm initialData={billingAddress} onDataChange={handleBillingAddressChange} isReadOnly={isReadOnly} />
        </div>
      )}

      {/* Read-only mode: Show summary of both addresses */}
      {isReadOnly && !sameAsShipping && (
        <div className="mt-4 border-t pt-4">
          <h3 className="text-lg font-medium text-neutral-800 mb-2">Billing Address</h3>
          <div className="text-neutral-600">
            <p>{billingAddress.contactName}</p>
            <p>
              {billingAddress.street} {billingAddress.streetNumber}
            </p>
            <p>
              {billingAddress.zipCode} {billingAddress.city}
            </p>
            <p>{billingAddress.country}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Addresses;
