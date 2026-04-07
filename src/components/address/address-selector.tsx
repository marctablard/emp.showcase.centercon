'use client';

import React, { ReactNode, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useAddresses } from '@/hooks/customer/useAddresses';
import { useLegalEntityCheckoutAddresses } from '@/hooks/customer/useLegalEntityCheckoutAddresses';
import { ADDRESS_TYPE } from '@/lib/common/address-type-constants';
import { cn } from '@/lib/utils';
import { Address, AddressType } from '@/platform/services/model/common';
import { CustomerAddress } from '@/platform/services/model/customer/customer';

export interface AddressSelectorProps {
  onSelect: (address: Address) => void;
  triggerElement?: ReactNode;
  selectedAddressId?: string;
  title?: string;
  showAddressTypes?: boolean;
  addressType?: AddressType;
  className?: string;
  /** `customer` = profile addresses; `legalEntity` = legal entity locations (B2B checkout). */
  addressBook?: 'customer' | 'legalEntity';
}

interface AddressSelectorInnerProps extends Omit<AddressSelectorProps, 'addressBook'> {
  addresses: CustomerAddress[] | undefined;
  loading: boolean;
}

function AddressSelectorInner({
  onSelect,
  triggerElement,
  selectedAddressId,
  title,
  showAddressTypes = true,
  addressType,
  className,
  addresses,
  loading,
}: AddressSelectorInnerProps) {
  const t = useTranslations('account.AddressForm');
  const [open, setOpen] = useState(false);
  const [internalSelectedId, setInternalSelectedId] = useState<string | undefined>(selectedAddressId);

  const resolvedSelectedId = selectedAddressId ?? internalSelectedId;

  const handleAddressSelect = (address: Address) => {
    if (selectedAddressId === undefined) {
      setInternalSelectedId(address.id);
    }
    onSelect(address);
    setOpen(false);
  };

  const formatAddress = (address: Address): string => {
    const streetSegments = [address.street, address.streetNumber].flatMap((s) => {
      const v = s?.trim();
      return v ? [v] : [];
    });
    const parts = [
      address.contactName,
      ...streetSegments,
      address.streetAppendix,
      `${address.zipCode} ${address.city}`,
      address.state,
      address.country,
    ].filter(Boolean);

    return parts.join(', ');
  };

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
                .filter((address) => !addressType || address.tags.includes(addressType))
                .map((address) => (
                  <div
                    key={address.id}
                    className={cn(
                      `p-4 my-2 border rounded-md cursor-pointer transition-colors hover:bg-surface-action-hover-2`,
                      `${resolvedSelectedId === address.id ? 'bg-surface-action text-text-on-action hover:bg-surface-action-hover hover:text-text-ho' : ''}`,
                    )}
                    onClick={() => handleAddressSelect(address)}
                    data-testid={`addressSelector-item-${address.id}`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <p className="font-bold">{address.contactName}</p>

                      {showAddressTypes && (
                        <div className="flex gap-1">
                          {address.tags.map((type) => (
                            <span
                              key={type}
                              className={`text-sm px-2 py-1 rounded-sm 
                              ${type === ADDRESS_TYPE.SHIPPING ? 'bg-surface-information text-text-action-hover' : 'bg-surface-warning text-text-warning'}`}
                            >
                              {type === ADDRESS_TYPE.SHIPPING
                                ? t('shipping')
                                : type === ADDRESS_TYPE.BILLING
                                  ? t('billing')
                                  : type}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <p className="text-sm">{formatAddress(address)}</p>

                    {address.isDefault && (
                      <div className="w-fit text-sm px-2 py-1 rounded-sm bg-surface-success text-text-body mt-1">
                        {t('default')}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-8">{t('noAddresses')}</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function AddressSelectorCustomerBook(props: Omit<AddressSelectorProps, 'addressBook'>) {
  const { addresses, loading } = useAddresses();
  return <AddressSelectorInner {...props} addresses={addresses} loading={loading} />;
}

function AddressSelectorLegalEntityBook(props: Omit<AddressSelectorProps, 'addressBook'>) {
  const { addresses, loading } = useLegalEntityCheckoutAddresses();
  return <AddressSelectorInner {...props} addresses={addresses} loading={loading} />;
}

/**
 * Dialog to pick an address from the customer profile book or the B2B legal-entity location book.
 *
 * @param onSelect - Callback when the user picks a row; receives the {@link Address} and closes the dialog.
 * @param triggerElement - Optional element that opens the dialog (default: secondary button with truncated label or “select address”).
 * @param selectedAddressId - Controlled selection id; when set, that row is highlighted and internal selection is not used for that id.
 * @param title - Dialog title override (default: translated “select an address”).
 * @param showAddressTypes - When true (default), show SHIPPING/BILLING chips from each address’s `tags`.
 * @param addressType - When set, filter to addresses whose `tags` include this role (e.g. checkout shipping passes shipping).
 * @param className - Extra classes on the default trigger button when `triggerElement` is omitted.
 * @param addressBook - `customer`: profile addresses via {@link useAddresses} → `/api/customer/current/addresses`. `legalEntity`: B2B locations via {@link useLegalEntityCheckoutAddresses} → `/api/customer/current/legal-entity-addresses`.
 */
export function AddressSelector({ addressBook = 'customer', ...props }: AddressSelectorProps) {
  if (addressBook === 'legalEntity') {
    return <AddressSelectorLegalEntityBook {...props} />;
  }
  return <AddressSelectorCustomerBook {...props} />;
}
