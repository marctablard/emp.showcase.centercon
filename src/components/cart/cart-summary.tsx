import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Info, LockKeyhole } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Cart } from '@/platform/services/model/cart';
import { Button } from '../ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { CartFreeship } from './cart-freeship';
import { CartRequest } from './cart-request';

interface CartSummaryProps {
  cart: Cart;
  isDelivery: boolean;
  loading: boolean;
}

export function CartSummary({ cart, isDelivery, loading }: CartSummaryProps) {
  const t = useTranslations('cart');
  const freeShippingValue = 400;

  return (
    <div className="col-span-1 mb-6 flex">
      <div className="flex flex-col gap-4 w-full">
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
              {isDelivery && freeShippingValue - cart.totalPrice.amount > 0 && <CartFreeship cart={cart} />}
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
        <CartRequest />
      </div>
    </div>
  );
}
