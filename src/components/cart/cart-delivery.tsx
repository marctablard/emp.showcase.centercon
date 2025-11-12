'use client';

import { useTranslations } from 'next-intl';
import { Pencil } from 'lucide-react';
import { useCheckout } from '@/hooks/checkout/useCheckout';
import { Address } from '@/platform/services/model/common';
import { AddressSelector } from '../address/address-selector';
import ShippingMethod from '../checkout/shipping-method';
import { AddressDisplay } from '../common/address-display';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';

export function CartDelivery() {
  const t = useTranslations('cart');
  const pickupAddress: Address = {
    companyName: 'Emporix AG',
    contactName: 'Philipp Grunewald',
    street: 'Bundesplatz',
    streetNumber: '16',
    city: 'Zug',
    country: 'Switzerland',
    zipCode: '300',
  };

  const { shippingAddress, shippingMethod, submitShippingAddress } = useCheckout();
  const isPickup = shippingMethod?.methodId === 'pickup';

  return (
    <Card className="p-0 border-none shadow-sm mb-4 lg:mb-6">
      <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2">
        <ShippingMethod variant="slim" />
        <div className="flex flex-col gap-4 pt-4 md:ps-6 md:pt-0">
          <div className="flex justify-between">
            <h5 className="text-3xl font-bold font-headlines">{isPickup ? t('pickup') : t('ship')}</h5>
            <AddressSelector
              onSelect={(address) => submitShippingAddress({ ...address, type: 'SHIPPING' })}
              selectedAddressId={shippingAddress?.id}
              triggerElement={
                <Button
                  variant="link"
                  size="default"
                  className="normal-case text-base tracking-normal p-0 gap-1 underline"
                >
                  {t('change')}
                  <Pencil />
                </Button>
              }
              title={t('selectShippingAddress')}
            />
          </div>
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            {shippingAddress && !isPickup && <AddressDisplay address={shippingAddress} />}
            {isPickup && (
              <>
                <AddressDisplay address={pickupAddress} />
                <div className="flex flex-col xl:pe-4 text-base w-full sm:w-1/2">
                  <div>
                    <span className="font-bold font-headlines">{t('hours')}</span>
                    <span>M-F 7:00 AM - 4:00 PM Central</span>
                  </div>
                  <div>
                    <span className="font-bold font-headlines">{t('phone')}</span>
                    <span>0123 987654-32</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
