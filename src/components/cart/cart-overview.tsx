'use client';

import { useState } from 'react';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowRight,
  ChevronDown,
  FileText,
  FolderUp,
  Info,
  LockKeyhole,
  Package,
  Pencil,
  Save,
  Share2,
  User,
} from 'lucide-react';
import z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import useAuthentication from '@/hooks/authentication/useAuthentication';
import { useCart } from '@/hooks/cart/useCart';
import { useAddresses } from '@/hooks/customer/useAddresses';
import { cn, formatCurrency } from '@/lib/utils';
import { Cart } from '@/platform/services/model/cart/cart';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { Form, FormControl, FormField, FormItem, FormLabel } from '../ui/form';
import UiLink from '../ui/link';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { CartItemRow } from './cart-item';

interface CartOverviewProps {
  initialCart?: Cart | null;
}

const FormSchemaDeliveryMethod = z.object({
  deliveryMethod: z.enum(['delivery', 'pickup'], {
    required_error: 'You need to select a delivery method.',
  }),
});

export function CartOverview({ initialCart }: CartOverviewProps) {
  const t = useTranslations('cart');

  const { cart, loading } = useCart(initialCart);
  const { getDefaultAddress } = useAddresses();
  const shippingAddress = getDefaultAddress('SHIPPING');

  const pickupAddress = {
    company: 'Emporix AG',
    firstName: 'Philipp',
    lastName: 'Grunewald',
    street: 'Bundesplatz 16',
    city: 'Zug',
    country: 'Switzerland',
    zip: '300',
  };

  const changeShippingAddress = () => {
    console.log('Open Modal Shipping Address');
  };

  const changePickupLocation = () => {
    console.log('Open Modal Pickup Location');
  };

  const form = useForm<z.infer<typeof FormSchemaDeliveryMethod>>({
    resolver: zodResolver(FormSchemaDeliveryMethod),
    defaultValues: {
      deliveryMethod: 'delivery',
    },
  });

  const freeShippingValue = 400;
  const [isDelivery, setIsDelivery] = useState(true);

  const { isAuthenticated } = useAuthentication();

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <Card className="mx-4 xl:mx-9">
          <CardHeader>
            <CardTitle className="text-center text-2xl">{t('yourCart')}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Spinner variant="lg" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (cart && cart.items.length > 0) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="mx-4 xl:mx-9">
          <div className="flex gap-3 align-end mb-8">
            <h3 className="text-5xl font-bold">{t('title')}</h3>
            <div className="text-neutral-300 text-xl m-0 leading-[2]">
              {' '}
              {cart.items.length > 1 ? cart.items.length + t('products') : cart.items.length + t('product')}
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 2xl:grid-cols-4">
            <div className="col-span-1 lg:col-span-2 2xl:col-span-3">
              <div className="flex flex-col md:flex-row justify-between mb-4 gap-4 sm:gap-1">
                <div className="flex flex-col sm:flex-row gap-1 sm:gap-6">
                  <Button
                    variant="link"
                    size="default"
                    className="normal-case text-base tracking-normal p-0 gap-1 underline justify-start"
                  >
                    {t('saveCart')}
                    <Save />
                  </Button>
                  <Button
                    variant="link"
                    size="default"
                    className="normal-case text-base tracking-normal p-0 gap-1 underline justify-start"
                  >
                    {t('loadCart')}
                    <FolderUp />
                  </Button>
                  <Button
                    variant="link"
                    size="default"
                    className="normal-case text-base tracking-normal p-0 gap-1 underline justify-start"
                  >
                    {t('share')}
                    <Share2 />
                  </Button>
                </div>
                <UiLink type="Link" href="/" variant="primary" size="m" iconAfter={<ArrowRight />}>
                  {t('backToShop')}
                </UiLink>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 2xl:grid-cols-4 gap-8">
            <div className="col-span-1 lg:col-span-2 2xl:col-span-3">
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
              <Card className="p-0 shadow-footer border-none mb-6 gap-3">
                <CardHeader className="pt-6 hidden md:block">
                  <div className="grid grid-cols-[120px_3fr_1fr_1fr] lg:grid-cols-[120px_2fr_1fr_1fr] xl:grid-cols-[120px_3fr_1fr_2fr] 2xl:grid-cols-[120px_4fr_1fr_1fr]">
                    <p className="col-start-1 font-bold">{t('product')}</p>
                    <p className="col-start-3 xl:col-start-3 font-bold">{t('qty')}</p>
                    <p className="col-start-4 xl:col-start-4 font-bold text-end">{t('price')}</p>
                  </div>
                </CardHeader>
                <CardContent className="px-6">
                  {cart?.items.map((item) => <CartItemRow key={item.id} cart={cart} item={item} />)}
                </CardContent>
              </Card>
            </div>

            <div className="col-span-1 mb-6 flex">
              <div className="mr-6 flex flex-col gap-4">
                <Card className="bg-primary-50 p-6 border-none gap-4 shadow-footer">
                  <CardHeader className="p-0">
                    <CardTitle>
                      <h5 className="text-3xl font-bold">{t('orderSummary')}</h5>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="bg-white rounded-md p-4">
                    <div className="space-y-4">
                      <div className="flex gap-2 text-primary-500">
                        <div>
                          <Info />
                        </div>
                        <div className="text-base">{t('promoCodeInfo')}</div>
                      </div>
                      <div className="flex justify-between">
                        <span className="">{t('valueOfGoods')}</span>
                        <span>{formatCurrency(cart?.subTotalPrice.amount, cart?.subTotalPrice.currency)}</span>
                      </div>

                      <div className="flex justify-between font-medium text-base pt-4 border-t border-neutral-200">
                        <span>{t('netValueOfGoods')}</span>
                        <span className="font-bold">{formatCurrency(cart.tax.netValue, cart.tax.currency)}</span>
                      </div>
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between font-medium text-base">
                          <span>{t('statutoryVat')}</span>
                          <span>{formatCurrency(cart.tax.amount, cart.tax.currency)}</span>
                        </div>
                        {isDelivery && (
                          <div className="flex justify-between font-medium text-base">
                            <span>{t('shippingCosts')}</span>
                            <span>folgt</span>
                          </div>
                        )}
                      </div>
                      {isDelivery && freeShippingValue - cart.totalPrice.amount > 0 && (
                        <CardContent className="flex flex-col gap-4 bg-primary-50 rounded-md p-4">
                          <div className="flex gap-2 text-primary-500">
                            <Package />
                            <div className="font-bold text-neutral-900">
                              {(freeShippingValue - cart.totalPrice.amount).toFixed(2) + t('untilFreeShipping')}
                            </div>
                          </div>
                          <div className="rounded-xl h-4 border border-primary-800">
                            <div
                              className="bg-gradient-to-t from-primary-700 to-primary-500 rounded-[inherit] h-full"
                              style={{ width: ((100 / freeShippingValue) * cart.totalPrice.amount).toFixed(0) + '%' }}
                            ></div>
                          </div>
                          <span className="text-primary-500">{t('freeShippingOn')}</span>
                          <UiLink type="Link" href="#" variant="primary" size="m" iconAfter={<ArrowRight />}>
                            {t('continueShopping')}
                          </UiLink>
                        </CardContent>
                      )}
                      <div className="flex flex-col gap-2">
                        {isDelivery && (
                          <div className="flex justify-between font-medium text-base">
                            <span>{t('freightCosts')}</span>
                            <span>folgt</span>
                          </div>
                        )}
                        <div className="flex justify-between font-bold text-xl">
                          <span>{t('total')}</span>
                          <span>{formatCurrency(cart.totalPrice.amount, cart.totalPrice.currency)}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col p-0">
                    <Link href="/checkout" className="w-full">
                      <Button className="w-full" disabled={!isDelivery || loading}>
                        {t('viewCart')}
                      </Button>
                    </Link>
                    <div className="flex align-center gap-2 text-neutral-600 pt-4">
                      <div>
                        <LockKeyhole width={12} />
                      </div>
                      <div className="text-sm leading-6">{t('dataTransmittedSecure')}</div>
                    </div>
                  </CardFooter>
                </Card>
                <Card className="bg-primary-50 p-6 border-none gap-4 mb-4 shadow-footer text-neutral-900">
                  <Collapsible>
                    <CollapsibleTrigger className="w-full group flex items-center justify-between gap-2">
                      <div className="flex gap-2">
                        <FileText />
                        <span className="flex items-center gap-2 font-bold">{t('requestQuote')}</span>
                      </div>
                      <ChevronDown
                        className="group-data-[state=open]:rotate-180 transition-transform"
                        width={32}
                        height={32}
                      />
                    </CollapsibleTrigger>
                    <CollapsibleContent
                      className={cn(
                        'pt-4 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
                      )}
                    >
                      <span className="text-base mb-4">{t('requestQuoteTitle')}</span>
                      <div className="flex flex-col gap-2 pt-4">
                        <div className="flex gap-2">
                          <p className={cn(!isAuthenticated && 'font-bold')}>1.</p>
                          {!isAuthenticated ? (
                            <p className="font-bold">{t('requestQuotestep1')}</p>
                          ) : (
                            <p>{t('requestQuotestep2')}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <p className={cn(!isAuthenticated && 'font-bold')}>2.</p>
                          {!isAuthenticated ? (
                            <p>{t('requestQuotestep2')}</p>
                          ) : (
                            <p className="">{t('requestQuotestep3')}</p>
                          )}
                        </div>
                        {!isAuthenticated && (
                          <div className="flex gap-2">
                            <p className="font-bold">3.</p>
                            <p>{t('requestQuotestep3')}</p>
                          </div>
                        )}
                      </div>
                      <Button className="w-full mt-4" variant="secondary" disabled={!isAuthenticated}>
                        {t('requestQuoteButton')}
                      </Button>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="max-w-6xl mx-auto mt-6 mb-16">
      <div className="mx-4 xl:mx-9">
        <div className="flex flex-col sm:justify-center items-center gap-6">
          <h1 className="text-5xl lg:text-8xl font-bold text-headlines font-headlines">{t('cartEmpty')}</h1>
          <p className="text-xl">{t('cartEmptyText')}</p>
          <div className="flex gap-2 sm:gap-6">
            <Link href="/login">
              <Button>
                {t('cartEmptyLogin')}
                <User />
              </Button>
            </Link>
            <Link href="/">
              <Button variant="secondary">
                {t('cartEmptyLinkText')}
                <ArrowRight />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
