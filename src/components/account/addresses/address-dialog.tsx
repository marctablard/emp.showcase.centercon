'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import AddressForm from '@/components/common/address-form';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAddresses } from '@/hooks/customer/useAddresses';
import { Address, AddressType } from '@/platform/services/model/common';
import { CustomerAddress } from '@/platform/services/model/customer/customer';

interface AddressDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (address: Partial<CustomerAddress>) => void;
  initialData?: Address;
  addressType?: AddressType;
  title?: string;
}

/**
 * Dialog for adding or editing addresses
 */
export function AddressDialog({
  isOpen,
  onOpenChange,
  onSave,
  initialData,
  addressType = 'SHIPPING',
  title,
}: AddressDialogProps) {
  const t = useTranslations('Account');
  const [formData, setFormData] = useState<Address | undefined>(initialData);
  const [isSaving, setIsSaving] = useState(false);
  const { createAddress, updateAddress } = useAddresses();

  // Handle save button click
  const handleSave = async () => {
    if (!formData) return;
    setIsSaving(true);
    try {
      // If we have an id, we're updating an existing address
      const addressId = initialData?.id;
      if (addressId) {
        const updatedAddress = await updateAddress(addressId, {
          ...formData,
          types: [addressType],
        });
        if (onSave) onSave(updatedAddress);
      } else {
        // Otherwise create a new address
        const newAddress = await createAddress({
          ...formData,
          types: [addressType],
        });
        if (onSave) onSave(newAddress);
      }
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to save address:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" showCloseButton>
        <DialogHeader>
          <DialogTitle>
            {title || (addressType === 'SHIPPING' ? t('Address.addShippingAddress') : t('Address.addBillingAddress'))}
          </DialogTitle>
          <DialogDescription>{t('Address.addressFormDescription')}</DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <AddressForm initialData={initialData} onDataChange={setFormData} />
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={isSaving}>
            {t('Address.cancel')}
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? t('Address.saving') : t('Address.saveAddress')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
