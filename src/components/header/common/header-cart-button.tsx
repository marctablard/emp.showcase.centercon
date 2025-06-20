import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { Cart } from '@platform/services/model/cart';
import { ShoppingCart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Spinner } from '@/components/ui/spinner';
import { useCart } from '@/hooks/cart/useCart';
import { useL10n } from '@/hooks/useL10n';
import { formatCurrency } from '@/lib/utils';

interface HeaderCartButtonProps {
  initialCart?: Cart | null;
}

export default function HeaderCartButton({ initialCart }: HeaderCartButtonProps) {
  const t = useTranslations('cart');
  const { l10n } = useL10n();

  // Pass initialCart directly to useCart to skip loading
  const { cart, loading, totalItems } = useCart(initialCart);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button className="pl-[11px] md:pl-4 pr-1 pb-2 pt-1 md:py-1 gap-4 self-center">
          <span className="text-white text-xl hidden md:inline-block">
            {loading ? '' : formatCurrency(cart?.totalPrice.amount || 0, cart?.totalPrice.currency || 'EUR')}
          </span>
          <div className="flex items-center w-[43px] h-[35px] relative">
            <Badge
              variant="white"
              className="h-5 min-w-5 rounded-full px-1 tabular-nums tracking-normal absolute top-0 right-0"
            >
              {loading ? <Spinner color="primary" variant="xs" /> : cart?.items.length || 0}
            </Badge>
            <ShoppingCart width="32" height="32" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 outline" align="end">
        <div className="p-4 border-b">
          <h3 className="font-medium">{t('yourCart')}</h3>
          <p className="text-sm text-muted-foreground">
            {totalItems} {t('items')}
          </p>
        </div>

        {loading ? (
          <div className="p-4 flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : !cart || cart.items.length === 0 ? (
          <div className="p-4 text-center">
            <p className="text-muted-foreground">{t('emptyCart')}</p>
          </div>
        ) : (
          <>
            <div className="max-h-80 overflow-auto">
              {cart.items.map((item) => (
                <div key={item.id} className="p-3 border-b flex items-center gap-3">
                  <div className="w-12 h-12 bg-muted flex-shrink-0 rounded overflow-hidden">
                    {item.product && item.product.images?.length ? (
                      <Image
                        width={64}
                        height={64}
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
                    <p className="text-sm font-medium truncate">{l10n(item.product?.name || 'Product')}</p>
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-muted-foreground">
                        {t('qty')}: {item.quantity}
                      </p>
                      <p className="text-sm font-medium">{formatCurrency(item.price.amount, item.price.currency)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t">
              <div className="flex justify-between mb-2">
                <span className="font-medium">{t('total')}</span>
                <span className="font-bold">{formatCurrency(cart.totalPrice.amount, cart.totalPrice.currency)}</span>
              </div>
              <Link href="/cart" className="block">
                <Button className="w-full">{t('viewCart')}</Button>
              </Link>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}
