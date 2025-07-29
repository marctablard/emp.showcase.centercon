import { RefObject, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Info, LockKeyhole } from 'lucide-react';
import useAuthDialog from '@/hooks/authentication/useAuthDialog';
import useAuthentication from '@/hooks/authentication/useAuthentication';
import { useCartTotal } from '@/hooks/cart/useCartTotal';
import { useElementScroll } from '@/hooks/ui/useElementScroll';
import { cn, formatCurrency } from '@/lib/utils';
import { Cart } from '@/platform/services/model/cart';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import UiLink from '../ui/link';
import { CartRequest } from './cart-request';

interface CartSummaryProps {
  cart: Cart;
  boundingContent: RefObject<HTMLDivElement | null>;
}

export function CartSummary({ cart, boundingContent }: CartSummaryProps) {
  const t = useTranslations('cart.summary');
  //const freeShippingValue = 400;

  const fixedContainer = useRef<HTMLDivElement>(null);
  const topPosition = 112;
  const { isFixed, isFixedToTop, isContainerBottom } = useElementScroll(fixedContainer, topPosition, boundingContent);
  const { cartTotal, shippingCosts, currency } = useCartTotal();
  const { isAuthenticated } = useAuthentication();
  const { openDialog } = useAuthDialog();

  return (
    <div className="col-span-1 xl:col-span-1 mb-6 flex">
      <div className={cn('flex flex-col w-full', isContainerBottom ? 'justify-end' : 'justify-start')}>
        <div
          className={cn(
            'flex flex-col gap-4',
            isFixed ? 'fixed lg:me-9' : '',
            isFixedToTop ? 'top-[112px]' : 'bottom-[40px]',
          )}
          ref={fixedContainer}
        >
          <Card className="bg-primary-50 p-6 border-none gap-4 shadow-sm lg:max-w-[438px] w-full">
            <CardHeader className="p-0">
              <CardTitle>
                <h5 className="text-3xl  font-headlines">{t('title')}</h5>
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

                <div className="flex justify-between text-base pt-4 border-t border-neutral-200">
                  <span>{t('netValueOfGoods')}</span>
                  <span className="font-bold font-headlines">
                    {formatCurrency(cart.tax.netValue, cart.tax.currency)}
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between text-base">
                    <span>{t('vat')}</span>
                    <span>{formatCurrency(cart.tax.amount, cart.tax.currency)}</span>
                  </div>
                  <div className="flex justify-between text-base">
                    <span>{t('shippingCosts')}</span>
                    {shippingCosts !== undefined ? (
                      <span>{formatCurrency(shippingCosts, currency)}</span>
                    ) : (
                      <span>{t('calculatedAtCheckout')}</span>
                    )}
                  </div>
                </div>
                {/*isDelivery && freeShippingValue - cart.totalPrice.amount > 0 && <CartFreeship cart={cart} />*/}
                <div className="flex flex-col gap-2">
                  {cart.fees && (
                    <div className="flex justify-between text-base">
                      <span>{t('fees')}</span>
                      <span>{formatCurrency(cart.fees.amount, cart.fees.currency)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold font-headlines text-xl">
                    <span>{t('total')}</span>
                    <span>{formatCurrency(cartTotal, currency)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col p-0">
              {!isAuthenticated ? (
                <UiLink
                  variant="button_primary"
                  type="Button"
                  className="w-full"
                  onClick={() =>
                    openDialog('login', { guestCheckout: true, redirectAfterLogin: true, callbackUrl: '/checkout' })
                  }
                >
                  {t('goToCheckout')}
                </UiLink>
              ) : (
                <UiLink variant="button_primary" type="Link" href="/checkout" className="w-full">
                  {t('goToCheckout')}
                </UiLink>
              )}
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
    </div>
  );
}
