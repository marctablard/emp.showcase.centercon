import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Cart, CartUpdate } from '@platform/services/model/cart';
import { MessageCircleWarning, ShoppingCart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { MiniCartContent, Tooltip, TooltipTrigger } from '@/components/ui/tooltip';
import { useCart } from '@/hooks/cart/useCart';
import { useCartTotal } from '@/hooks/cart/useCartTotal';
import { useL10n } from '@/hooks/useL10n';
import { cn, formatCurrency } from '@/lib/utils';
import { useNotificationStore } from '@/stores/notification-store';

interface HeaderCartButtonProps {
  initialCart?: Cart | null;
  showSum?: boolean;
}

export default function HeaderCartButton({ initialCart, showSum = true }: HeaderCartButtonProps) {
  const t = useTranslations('cart');
  const { hasNotification } = useNotificationStore();
  const { l10n } = useL10n();
  const router = useRouter();
  const [cartUpdate, setCartUpdate] = useState<CartUpdate | undefined>(undefined);
  const { cartTotal, shippingCosts, currency } = useCartTotal();
  // Pass initialCart directly to useCart to skip loading
  const { cart, loading } = useCart(initialCart);
  const [scrollHeight, setScrollHeight] = useState(false);
  const scrollContainer = useRef<HTMLDivElement>(null);

  const buildCartUpdateKey = (cart: Cart, cartUpdate: CartUpdate) => {
    return 'cart-' + cart.id + '-' + cartUpdate.itemId + '-' + cartUpdate.updatedAt;
  };

  useEffect(() => {
    if (cart && cart.processUpdate && cart.processUpdate.itemId) {
      if (!hasNotification(buildCartUpdateKey(cart, cart.processUpdate))) {
        setCartUpdate(cart.processUpdate);
      }
    }
  }, [cart, setCartUpdate, hasNotification]);

  const openChange = () => {
    setTimeout(() => {
      if (scrollContainer?.current?.offsetHeight && scrollContainer?.current?.offsetHeight >= 300) {
        setScrollHeight(true);
      } else {
        setScrollHeight(false);
      }
    }, 100);
  };

  return (
    <Tooltip onOpenChange={openChange}>
      <TooltipTrigger
        className="pl-[11px] md:pl-4 pr-1 pb-2 pt-1 md:py-1 gap-4 self-center cursor-pointer bg-primary-500 text-white border border-transparent hover:bg-primary-700 rounded-sm 'cursor-pointer uppercase inline-flex items-center justify-center gap-3 whitespace-nowrap px-4 py-3 text-base/6 tracking-widest font-bold transition-all disabled:pointer-events-none disabled:bg-neutral-100 disabled:text-neutral-600 [&_svg]:pointer-events-none shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white"
        onClick={() => router.push('/cart')}
      >
        {showSum && (
          <span className="text-white text-xl hidden md:inline-block">
            {formatCurrency(cartTotal || 0.0, currency)}
          </span>
        )}
        <div className="flex items-center w-[43px] h-[35px] relative">
          {cartUpdate ? (
            <Badge
              variant="warning"
              className="h-5 min-w-5 rounded-full px-1 tabular-nums tracking-normal absolute top-0 right-0"
            >
              <MessageCircleWarning />
            </Badge>
          ) : (
            <Badge
              variant="white"
              className="h-5 min-w-5 rounded-full px-1 tabular-nums tracking-normal absolute top-0 right-0"
            >
              {loading ? <Spinner color="primary" variant="xs" /> : cart?.items.length || 0}
            </Badge>
          )}
          <ShoppingCart width="32" height="32" />
        </div>
      </TooltipTrigger>
      <MiniCartContent sideOffset={24}>
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
              {cart.items.map((item) => (
                <div key={item.id} className={`pt-4 first:pt-0 pb-4 border-b flex items-end justify-between gap-3`}>
                  <div className="flex gap-4">
                    <div className="rounded-ss-xl rounded-ee-xl w-[100px] h-[65px] object-fit overflow-hidden">
                      {item.product && item.product.images?.length ? (
                        <Image
                          width={100}
                          height={65}
                          src={String(item.product.images[0].url)}
                          alt={String(item.product.name || 'Product')}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <ShoppingCart className="h-6 w-6 opacity-30" />
                        </div>
                      )}
                    </div>
                    <div className="flex-grow min-w-0">
                      <p className="text-sm">{l10n(item.product?.brand?.name || 'Brand')}</p>
                      <p
                        className="font-bold truncate font-headlines cursor-pointer"
                        onClick={() => router.push(`/product/${item.product?.id}`)}
                      >
                        {l10n(item.product?.name || 'Product')}
                      </p>
                      <div className="flex items-center">
                        <p className="text-xs border-r border-neutral-200 pr-4">
                          {t('itemNumber')} {item.product?.id}
                        </p>
                        <p className="text-xs pl-4">
                          {t('qty')}: {item.quantity}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div>
                    {cartUpdate && cartUpdate?.itemId === item.id && (
                      <Badge variant="warning" className="h-5 min-w-5 rounded-full px-1 tabular-nums tracking-normal">
                        <MessageCircleWarning />
                      </Badge>
                    )}
                    <p
                      className={`font-bold font-headlines ${cartUpdate && cartUpdate?.itemId === item.id ? 'bg-orange-100/75' : ''}`}
                    >
                      {formatCurrency(item.price.amount, item.price.currency)}
                    </p>
                  </div>
                </div>
              ))}
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
      </MiniCartContent>
    </Tooltip>
  );
}
