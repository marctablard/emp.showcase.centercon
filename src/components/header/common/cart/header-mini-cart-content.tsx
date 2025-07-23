import { RefObject } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Cart, CartUpdate } from '@platform/services/model/cart';
import { HeaderMiniCartItemList } from '@/components/header/common/cart/header-mini-cart-item-list';
import { Button } from '@/components/ui/button';
import { useCartTotal } from '@/hooks/cart/useCartTotal';
import { cn, formatCurrency } from '@/lib/utils';

interface HeaderMiniCartContentProps {
  loading: boolean;
  cart?: Cart | null;
  scrollHeight: boolean;
  scrollContainer: RefObject<HTMLDivElement | null>;
  cartUpdate?: CartUpdate;
}

export function HeaderMiniCartContent({
  loading,
  cart,
  scrollHeight,
  scrollContainer,
  cartUpdate,
}: HeaderMiniCartContentProps) {
  const t = useTranslations('cart');
  const { cartTotal, shippingCosts, currency } = useCartTotal();
  const router = useRouter();

  return (
    <>
      {loading ? (
        <div className="p-4 flex items-center justify-center">
          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : !cart || cart.items.length === 0 ? (
        <div className="p-4 text-center">
          <p className="text-muted-foreground">{t('emptyCart')}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4 justify-center rounded-md pt-4">
          <div
            className={cn(scrollHeight ? 'overflow-y-scroll pr-0.5' : 'pr-4', 'max-h-[300px]')}
            ref={scrollContainer}
          >
            <HeaderMiniCartItemList cart={cart} cartUpdate={cartUpdate} />
          </div>
          {cart && (
            <div className="flex flex-col gap-2 pr-4">
              <div className="flex justify-between border-b border-neutral-200 py-2">
                <span className="">{t('summary.valueOfGoods')}</span>
                <span>{formatCurrency(cart?.subTotalPrice.amount, cart?.subTotalPrice.currency)}</span>
              </div>
              <div className="flex justify-between">
                <span>{t('summary.vat')}</span>
                <span>{formatCurrency(cart.tax.amount, cart.tax.currency)}</span>
              </div>
              <div className="flex justify-between">
                <span>{t('summary.shippingCosts')}</span>
                {shippingCosts ? (
                  <span>{formatCurrency(shippingCosts, currency)}</span>
                ) : (
                  <span>{t('summary.calculatedAtCheckout')}</span>
                )}
              </div>

              {cart.fees && (
                <div className="flex justify-between">
                  <span>{t('fees')}</span>
                  <span>{formatCurrency(cart.fees.amount, cart.fees.currency)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-base font-headlines">
                <span>{t('total')}</span>
                <span>{formatCurrency(cartTotal, currency)}</span>
              </div>
            </div>
          )}
          <div className="pr-4">
            <Button className="w-full" onClick={() => router.push('/cart')}>
              {t('viewCart')}
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
