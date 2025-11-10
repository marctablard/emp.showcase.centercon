'use client';

import React, { ReactNode, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useAddresses } from '@/hooks/customer/useAddresses';
import { Address, AddressType } from '@/platform/services/model/common';

interface AddressSelectorProps {
  onSelect: (address: Address) => void;
  triggerElement?: ReactNode;
  selectedAddressId?: string;
  title?: string;
  showAddressTypes?: boolean;
  addressType?: AddressType;
  className?: string;
}

/**
 * Address selector component that shows a dialog with available addresses
 * @param onSelect - Callback function when an address is selected
 * @param triggerElement - Custom trigger element (optional)
 * @param selectedAddressId - Currently selected address ID (optional)
 * @param title - Dialog title (default: "Select an Address")
 * @param showAddressTypes - Whether to display address types badges (default: true)
 * @param className - Additional CSS class for the component
 */
export function AddressSelector({
  onSelect,
  triggerElement,
  selectedAddressId,
  title,
  showAddressTypes = true,
  addressType,
  className,
}: AddressSelectorProps) {
  const t = useTranslations('account.AddressForm');
  const [open, setOpen] = useState(false);
  const [internalSelectedId, setInternalSelectedId] = useState<string | undefined>(selectedAddressId);
  const { addresses, loading } = useAddresses();

  const resolvedSelectedId = selectedAddressId ?? internalSelectedId;

  const handleAddressSelect = (address: Address) => {
    if (selectedAddressId === undefined) {
      setInternalSelectedId(address.id);
    }
    onSelect(address);
    setOpen(false);
  };

  const formatAddress = (address: Address): string => {
    const parts = [
      address.contactName,
      address.street + (address.streetNumber ? ` ${address.streetNumber}` : ''),
      address.streetAppendix,
      `${address.zipCode} ${address.city}`,
      address.state,
      address.country,
    ].filter(Boolean);

    return parts.join(', ');
  };

  // Get the selected address object based on the ID
  const selectedAddress = resolvedSelectedId ? addresses?.find((addr) => addr.id === resolvedSelectedId) : undefined;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerElement ? (
          triggerElement
        ) : (
          <Button variant="secondary" className={className}>
            {selectedAddress ? formatAddress(selectedAddress).substring(0, 30) + '...' : t('selectAnAddress')}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title || t('selectAnAddress')}</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : addresses && addresses.length > 0 ? (
            <div className="max-h-[400px] overflow-y-auto">
              {addresses
                .filter((address) => !addressType || address.types.includes(addressType))
                .map((address) => (
                  <div
                    key={address.id}
                    className={`p-4 my-2 border rounded-md cursor-pointer transition-colors hover:bg-gray-100 
                    ${resolvedSelectedId === address.id ? 'border-primary bg-primary/10' : 'border-gray-200'}`}
                    onClick={() => handleAddressSelect(address)}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <p className="font-bold">{address.contactName}</p>

                      {showAddressTypes && (
                        <div className="flex gap-1">
                          {address.types.map((type) => (
                            <span
                              key={type}
                              className={`text-xs px-2 py-1 rounded-sm 
                              ${type === 'SHIPPING' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}
                            >
                              {type === 'SHIPPING' ? t('shipping') : type === 'BILLING' ? t('billing') : type}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <p className="text-sm text-gray-700">{formatAddress(address)}</p>

                    {address.isDefault && <div className="text-xs text-green-600 mt-1">{t('default')}</div>}
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">{t('noAddresses')}</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
