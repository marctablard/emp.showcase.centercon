import { useState } from 'react';
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
  const [isOpen, setIsOpen] = useState(false);

  let isDelivery = true;

  return (
    <Popover open={isOpen}>
      <PopoverTrigger asChild>
        <Button
          className="pl-[11px] md:pl-4 pr-1 pb-2 pt-1 md:py-1 gap-4 self-center"
          onMouseEnter={() => setIsOpen(true)}
        >
          <span className="text-white text-xl hidden md:inline-block">
            {loading ? '' : formatCurrency(cart?.totalPrice.amount || 0, cart?.totalPrice.currency || 'EUR')}
          </span>
          <div className="flex items-center w-[43px] h-[35px] relative">
            <Badge variant="white" className="h-5 min-w-5 rounded-full px-1 tabular-nums absolute top-0 right-0">
              {loading ? <Spinner color="primary" variant="xs" /> : cart?.items.length || 0}
            </Badge>
            <ShoppingCart width="32" height="32" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[600px] mt-4 -mr- pt-0 pr-0 opacity-85 border-none shadow-xl parent:backdrop-blur-xs @apply backdrop-blur-xs"
        align="end"
        side="top"
        sideOffset={8}
        onMouseLeave={() => setIsOpen(false)}
      >
        {loading ? (
          <div className="p-4 flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : !cart || cart.items.length === 0 ? (
          <div className="p-4 text-center">
            <p className="text-muted-foreground">{t('emptyCart')}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4 justify-center">
            <div className="overflow-y-scroll max-h-[250px] pr-2">
              {cart.items.map((item) => (
                <div key={item.id} className="py-4 border-b flex items-end justify-between gap-3">
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
                      <p className="text-sm">folgt</p>
                      <p className="font-bold truncate">{l10n(item.product?.name || 'Product')}</p>
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
                    <p className="font-bold">{formatCurrency(item.price.amount, item.price.currency)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-2 pr-4">
              <div className="flex justify-between border-b border-neutral-200 py-2">
                <span className="">{t('valueOfGoods')}</span>
                <span>{formatCurrency(cart?.subTotalPrice.amount, cart?.subTotalPrice.currency)}</span>
              </div>
              <div className="flex justify-between">
                <span>{t('statutoryVat')}</span>
                <span>{formatCurrency(cart.tax.amount, cart.tax.currency)}</span>
              </div>
              {isDelivery && (
                <div className="flex justify-between">
                  <span>{t('shippingCosts')}</span>
                  <span>folgt</span>
                </div>
              )}
              {isDelivery && (
                <div className="flex justify-between">
                  <span>{t('freightCosts')}</span>
                  <span>folgt</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-base">
                <span>{t('total')}</span>
                <span>{formatCurrency(cart.totalPrice.amount, cart.totalPrice.currency)}</span>
              </div>
            </div>
            <Link href="/cart" className="block pr-4">
              <Button className="w-full">{t('viewCart')}</Button>
            </Link>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
