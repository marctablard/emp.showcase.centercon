import { RefObject, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Info, LockKeyhole } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { Cart } from '@/platform/services/model/cart';
import { Button } from '../ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { CartFreeship } from './cart-freeship';
import { CartRequest } from './cart-request';

interface CartSummaryProps {
  cart: Cart;
  isDelivery: boolean;
  loading: boolean;
  leftContent: RefObject<HTMLDivElement | null>;
}

export function CartSummary({ cart, isDelivery, loading, leftContent }: CartSummaryProps) {
  const t = useTranslations('cart');
  const freeShippingValue = 400;

  const fixedContainer = useRef<HTMLDivElement>(null);
  const [isFixed, setIsFixed] = useState(false);
  const [isFixedToTop, setIsFixedToTop] = useState(false);
  const [isContainerBottom, setIsContainerBottom] = useState(false);
  const topPosition = 112;

  window.addEventListener('scroll', () => {
    const containerHeight = Math.round(
      fixedContainer?.current?.getBoundingClientRect().height
        ? fixedContainer?.current?.getBoundingClientRect().height
        : 0,
    );
    const containerTop = Math.round(
      fixedContainer?.current?.getBoundingClientRect().top ? fixedContainer?.current?.getBoundingClientRect().top : 0,
    );
    const containerBottom = Math.round(
      fixedContainer?.current?.getBoundingClientRect().bottom
        ? fixedContainer?.current?.getBoundingClientRect().bottom + 24
        : 0,
    );
    const windowHeight = window.innerHeight;
    const windowScroll = window.scrollY;
    const contentBox = leftContent?.current?.getBoundingClientRect();
    const contentBottom = Math.round(contentBox?.bottom ? contentBox?.bottom : 0);
    const contentTop = Math.round(contentBox?.top ? contentBox?.top : 0);
    const contentHeight =
      leftContent?.current?.children &&
      Array.from(leftContent?.current?.children)
        .map((item) => item.getBoundingClientRect().height)
        .reduce((a, b) => a + b, 0);

    if (containerHeight && contentHeight && containerHeight <= contentHeight) {
      if (containerBottom && contentBottom && containerBottom < contentBottom) {
        if (containerTop && containerTop <= topPosition) {
          setIsFixed(true);
          setIsFixedToTop(true);
          if (contentTop && contentTop > containerTop) {
            setIsFixed(false);
            setIsContainerBottom(false);
          }
        } else {
          if (contentTop && contentTop > containerTop) {
            setIsFixed(false);
            setIsContainerBottom(false);
          }
        }
      } else {
        setIsFixed(false);
        if (containerBottom && contentBottom && containerBottom > contentBottom) {
          setIsContainerBottom(true);
        }
        /*  if (containerBottom && windowHeight - containerBottom <= 12) {
         
          setIsFixed(true);
          setIsFixedToTop(false);
        } */
      }
    }
  });

  return (
    <div className="col-span-1 mb-6 flex">
      <div className={cn('flex flex-col w-full', isContainerBottom ? 'justify-end' : 'justify-start')}>
        <div
          className={cn(
            'flex flex-col gap-4',
            isFixed ? 'fixed lg:me-9' : '',
            isFixedToTop ? 'top-[112px]' : 'bottom-[12px]',
          )}
          ref={fixedContainer}
        >
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
                      <span>Shipping Costs</span>
                    </div>
                  )}
                </div>
                {isDelivery && freeShippingValue - cart.totalPrice.amount > 0 && <CartFreeship cart={cart} />}
                <div className="flex flex-col gap-2">
                  {isDelivery && (
                    <div className="flex justify-between font-medium text-base">
                      <span>{t('freightCosts')}</span>
                      <span>Freight Costs</span>
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
              <Button type="submit" form="cart-delivery-form" className="w-full" disabled={!isDelivery || loading}>
                {t('goToCheckout')}
              </Button>

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
