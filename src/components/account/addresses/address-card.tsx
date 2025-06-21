'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Edit, MapPin, Plus, Trash } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { useAddresses } from '@/hooks/customer/useAddresses';
import { useToast } from '@/hooks/ui/useToast';
import { Address, AddressType } from '@/platform/services/model/common';
import { AddressDialog } from './address-dialog';

// Extended interface for addresses with IDs (from API responses)
interface ExtendedAddress extends Address {
  // id und isDefault sind jetzt bereits im Address-Interface
  _id?: string; // nur für Kompatibilität mit API-Antworten
}

interface AddressCardProps {
  address: ExtendedAddress;
  isDeleting?: boolean;
  onEdit?: (address: ExtendedAddress) => void;
  onDelete?: (address: ExtendedAddress) => void;
}

/**
 * Individual address card component
 */
export function AddressCard({ address, isDeleting = false, onEdit, onDelete }: AddressCardProps) {
  const t = useTranslations('Account');

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-medium">
            {address.contactName}
            {address.isDefault && (
              <Badge variant="secondary" className="ml-2">
                {t('default')}
              </Badge>
            )}
          </CardTitle>
          <div className="flex space-x-2">
            {onEdit && (
              <Button
                variant="secondary"
                size="icon"
                className="h-8 w-8"
                onClick={() => onEdit(address)}
                aria-label={t('editAddress')}
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="secondary"
                size="icon"
                className="h-8 w-8"
                onClick={() => onDelete(address)}
                disabled={isDeleting}
                aria-label={t('deleteAddress')}
              >
                {isDeleting ? <Spinner variant="sm" /> : <Trash className="h-4 w-4" />}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-start space-x-2">
          <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
          <div className="space-y-1">
            {address.companyName && <p className="text-sm">{address.companyName}</p>}
            <p className="text-sm">
              {address.street} {address.streetNumber || ''}
            </p>
            <p className="text-sm">
              {address.zipCode} {address.city}
            </p>
            <p className="text-sm">{address.country}</p>
            {address.contactPhone && <p className="text-sm">{address.contactPhone}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Addresses list component
 * Displays all shipping addresses for a customer
 */
export function AddressesList({ type = 'SHIPPING' as AddressType }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentAddress, setCurrentAddress] = useState<ExtendedAddress | null>(null);
  const [deletingAddressId, setDeletingAddressId] = useState<string | null>(null);
  const t = useTranslations('Account');
  const { toast } = useToast();
  const { addresses, loading, error, fetchAddresses, deleteAddress } = useAddresses();

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{t('errorLoadingAddresses')}</p>
        <Button variant="secondary" onClick={() => fetchAddresses()} className="mt-4">
          {t('tryAgain')}
        </Button>
      </div>
    );
  }

  if (!addresses || addresses.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">{t('noAddresses')}</p>
        <Button onClick={() => setIsDialogOpen(true)} className="mt-4">
          <Plus className="mr-2 h-4 w-4" />
          {t('addNewAddress')}
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold">
          {type === 'SHIPPING' ? t('shippingAddresses') : t('billingAddresses')}
        </h1>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {t('addNewAddress')}
        </Button>
      </div>

      {addresses.filter((address) => address.types.includes(type)).length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            {type === 'SHIPPING' ? t('noShippingAddresses') : t('noBillingAddresses')}
          </p>
          <Button onClick={() => setIsDialogOpen(true)} className="mt-4">
            <Plus className="mr-2 h-4 w-4" />
            {t('addNewAddress')}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {addresses
            .filter((address) => address.types.includes(type))
            .map((address: ExtendedAddress) => {
              return (
                <AddressCard
                  key={address.id || `${address.contactName}-${address.street}-${address.city}`}
                  address={address}
                  isDeleting={deletingAddressId === (address.id || (address as any)._id)}
                  onEdit={(addr) => {
                    // Öffnet den Dialog im Bearbeitungsmodus
                    setCurrentAddress(addr);
                    setIsDialogOpen(true);
                  }}
                  onDelete={async (address) => {
                    if (window.confirm(t('confirmDeleteAddress'))) {
                      try {
                        const addressId = address.id || (address as any)._id;
                        if (addressId) {
                          setDeletingAddressId(addressId);

                          await deleteAddress(addressId);
                          // Die Adressliste wird automatisch durch den Hook aktualisiert
                          toast({
                            title: t('success'),
                            description: t('addressDeleted'),
                            variant: 'success',
                          });
                        }
                      } catch (error) {
                        console.error('Error deleting address:', error);
                        toast({
                          title: t('error'),
                          description: t('errorDeletingAddress'),
                          variant: 'destructive',
                        });
                      } finally {
                        setDeletingAddressId(null);
                      }
                    }
                  }}
                />
              );
            })}
        </div>
      )}

      {/* Render the dialog in a single place */}
      <AddressDialog
        isOpen={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            // Dialog wurde geschlossen, Adresse zurücksetzen
            setCurrentAddress(null);
          }
        }}
        addressType={type}
        initialData={currentAddress || {}}
        title={
          currentAddress ? t('editAddress') : type === 'SHIPPING' ? t('addShippingAddress') : t('addBillingAddress')
        }
        onSave={(savedAddress) => {
          console.log('Address saved:', savedAddress);
          fetchAddresses();
        }}
      />
    </div>
  );
}
