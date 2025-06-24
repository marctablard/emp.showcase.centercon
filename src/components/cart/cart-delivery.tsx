'use client';

import { useTranslations } from 'next-intl';
import { Pencil } from 'lucide-react';
import useAuthentication from '@/hooks/authentication/useAuthentication';
import { useAddresses } from '@/hooks/customer/useAddresses';
import { useValidator } from '@/hooks/validation/useValidator';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel } from '../ui/form';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';

interface CartDeliveryProps {
  isDelivery: boolean;
  setIsDelivery: React.Dispatch<React.SetStateAction<boolean>>;
}

export function CartDelivery({ isDelivery, setIsDelivery }: CartDeliveryProps) {
  const t = useTranslations('cart');

  const { form } = useValidator(
    'CartDeliveryValidationService',
    {
      deliveryMethod: 'delivery',
    },
    'onBlur',
  );

  const changeShippingAddress = () => {
    console.log('Open Modal Shipping Address');
  };

  const changePickupLocation = () => {
    console.log('Open Modal Pickup Location');
  };

  const pickupAddress = {
    company: 'Emporix AG',
    firstName: 'Philipp',
    lastName: 'Grunewald',
    street: 'Bundesplatz 16',
    city: 'Zug',
    country: 'Switzerland',
    zip: '300',
  };

  const { isAuthenticated } = useAuthentication();
  const { getDefaultAddress } = useAddresses();
  const shippingAddress = getDefaultAddress('SHIPPING');

  return (
    <Card className="p-0 border-none shadow-footer mb-6">
      <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2">
        <div className="border-b pb-4 md:border-r md:border-b-0 md:pb-0 flex flex-col gap-4">
          <h5 className="text-3xl font-bold">{t('deliveryMethod')}</h5>
          <Form {...form}>
            <FormField
              control={form.control}
              name="deliveryMethod"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <RadioGroup
                    onValueChange={(value) => setIsDelivery(value === 'delivery')}
                    defaultValue={field.value}
                    className="flex flex-col"
                  >
                    <FormItem className="flex items-center gap-3">
                      <FormControl>
                        <RadioGroupItem value="delivery" />
                      </FormControl>
                      <FormLabel className="font-normal">{t('ship')}</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center gap-3">
                      <FormControl>
                        <RadioGroupItem value="pickup" />
                      </FormControl>
                      <FormLabel className="font-normal">{t('pickup')}</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormItem>
              )}
            />
          </Form>
        </div>
        <div className="flex flex-col gap-4 pt-4 md:ps-6 md:pt-0">
          <div className="flex justify-between">
            <h5 className="text-3xl font-bold">{isDelivery ? t('ship') : t('pickup')}</h5>
            <Button
              variant="link"
              size="default"
              className="normal-case text-base tracking-normal p-0 gap-1 underline"
              onClick={() => (isDelivery ? changeShippingAddress() : changePickupLocation())}
            >
              {t('change')}
              <Pencil />
            </Button>
          </div>
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            {isAuthenticated && shippingAddress && (
              <div>
                <p>{shippingAddress?.companyName}</p>
                <p>{shippingAddress?.contactName}</p>
                <p>{shippingAddress?.street}</p>
                <p>{shippingAddress?.city}</p>
                <p>{shippingAddress?.country}</p>
              </div>
            )}
            {!isDelivery && (
              <>
                <div>
                  <p>{pickupAddress.company}</p>
                  <p>{pickupAddress.firstName + ' ' + pickupAddress.lastName}</p>
                  <p>{pickupAddress.street}</p>
                  <p>{pickupAddress.zip + ' ' + pickupAddress.city}</p>
                  <p>{pickupAddress.country}</p>
                </div>
                <div className="flex flex-col xl:pe-4 text-base w-full sm:w-1/2">
                  <div>
                    <span className="font-bold">{t('hours')}</span>
                    <span>M-F 7:00 AM - 4:00 PM Central</span>
                  </div>
                  <div>
                    <span className="font-bold">{t('phone')}</span>
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
