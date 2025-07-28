import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Cart, CartUpdate } from '@platform/services/model/cart';
import { MessageCircleWarning, ShoppingCart } from 'lucide-react';
import { HeaderMiniCartContent } from '@/components/header/common/cart/header-mini-cart-content';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { MiniCartTooltipContent, Tooltip, TooltipTrigger } from '@/components/ui/tooltip';
import { useCart } from '@/hooks/cart/useCart';
import { useCartTotal } from '@/hooks/cart/useCartTotal';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { formatCurrency } from '@/lib/utils';
import { useNotificationStore } from '@/stores/notification-store';

interface HeaderCartButtonProps {
  initialCart?: Cart | null;
  showSum?: boolean;
}

export function HeaderCartButton({ initialCart, showSum = true }: HeaderCartButtonProps) {
  const t = useTranslations('layout.header');
  const { hasNotification } = useNotificationStore();
  const router = useRouter();
  const [cartUpdate, setCartUpdate] = useState<CartUpdate | undefined>(undefined);
  const { cartTotal, currency } = useCartTotal();
  // Pass initialCart directly to useCart to skip loading
  const { cart, loading } = useCart(initialCart);
  const [scrollHeight, setScrollHeight] = useState(false);
  const scrollContainer = useRef<HTMLDivElement>(null);
  const isMediumScreen = useBreakpoint('md');

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
        aria-label={t('viewCart')}
        className="pl-[11px] md:pl-4 pr-1 pb-2 pt-1 md:py-1 self-center bg-primary-500 text-white border border-transparent hover:bg-primary-700 rounded-sm cursor-pointer uppercase inline-flex items-center justify-center gap-3 whitespace-nowrap px-4 py-3 text-base/6 tracking-widest font-bold transition-all disabled:pointer-events-none disabled:bg-neutral-100 disabled:text-neutral-600 [&_svg]:pointer-events-none shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white"
        onClick={() => router.push('/cart')}
      >
        {showSum && isMediumScreen && (
          <span className="text-white text-xl">{formatCurrency(cartTotal || 0.0, currency)}</span>
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
      <MiniCartTooltipContent sideOffset={24}>
        <HeaderMiniCartContent
          loading={loading}
          cart={cart}
          scrollHeight={scrollHeight}
          scrollContainer={scrollContainer}
          cartUpdate={cartUpdate}
        />
      </MiniCartTooltipContent>
    </Tooltip>
  );
}
