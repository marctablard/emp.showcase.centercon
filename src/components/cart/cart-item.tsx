'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/cart/useCart';
import { useL10n } from '@/hooks/useL10n';
import { cn, formatCurrency } from '@/lib/utils';
import { Cart, CartItem } from '@/platform/services/model/cart/cart.d';

interface CartItemProps {
  cart: Cart;
  item: CartItem;
}

export function CartItemRow({ cart, item }: CartItemProps) {
  const { l10n } = useL10n();
  const t = useTranslations('cart');
  const { updateItemQuantity, removeItem } = useCart(cart);
  const [isProcessing, setIsProcessing] = useState(false);

  const isStrike = false;

  // Handle quantity update
  const handleUpdateQuantity = async (newQuantity: number) => {
    if (newQuantity < 1 || isProcessing) return;

    setIsProcessing(true);
    try {
      updateItemQuantity(item.id, newQuantity);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle item removal
  const handleRemoveItem = async () => {
    if (isProcessing) return;

    setIsProcessing(true);
    try {
      removeItem(item.id);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="py-6 first:border-none border-t border-neutral-200 md:first:border-solid">
      <div className="grid grid-cols-[1fr_2fr] sm:grid-cols-[120px_3fr] md:grid-cols-[120px_3fr_1fr_1fr] lg:grid-cols-[120px_2fr_1fr_1fr] xl:grid-cols-[120px_3fr_1fr_2fr] 2xl:grid-cols-[120px_4fr_1fr_1fr]">
        <div className="col-start-1 row-start-2 md:row-start-1 row-end-3">
          <div className="rounded-ss-xl rounded-ee-xl w-[100px] h-[65px] sm:w-[120px] sm:h-[78px] object-fit overflow-hidden">
            {item.product && item.product.images?.length ? (
              <Image
                width={100}
                height={65}
                src={String(item.product.images[0].url)}
                alt={String(item.product.name || 'Product')}
                className="rounded-ss-xl-[inherit] rounded-ee-xl-[inherit] w-[100px] h-[65px] sm:w-[120px] sm:h-[78px]"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                <ShoppingCart className="h-8 w-8 opacity-30" />
              </div>
            )}
          </div>
        </div>
        <div className="col-start-1 col-end-3 row-start-1 md:col-start-2 flex flex-col gap-1 mb-4 md:mb-0 md:ms-4">
          <p className="text-sm md:text-base">Serie GMV</p>
          <p className="font-bold text-base">{l10n(item.product?.name || 'Product')}</p>
        </div>
        <div className="row-start-3 col-start-2 md:col-end-2 flex flex-col gap-2 md:row-start-2 ms-4 pt-2">
          <p className="text-sm">
            {t('itemNumber')}: {item.product?.id}
          </p>
          <p className="text-sm text-success-500">{t('available')}</p>
          <Button variant="link" size="small" className="normal-case text-sm tracking-normal p-0 justify-start">
            {t('addToWishlist')}
          </Button>
        </div>
        <div className="col-start-2 row-start-4 md:col-start-3 md:col-end-3 md:row-start-1 lg:col-start-3 flex gap-4 ms-4 mt-4 md:ms-0 md:mt-0">
          <div className="w-full flex">
            {item.quantity <= 1 ? (
              <Button
                variant="secondary"
                size="icon"
                className="p-3 h-13 border-neutral-300 rounded-none rounded-ss-sm rounded-es-sm"
                disabled={isProcessing}
                onClick={handleRemoveItem}
              >
                <Trash2 className="h-6 w-6" />
              </Button>
            ) : (
              <Button
                variant="secondary"
                size="icon"
                className="p-3 h-13 border-neutral-300 rounded-none rounded-ss-sm rounded-es-sm"
                disabled={isProcessing}
                onClick={() => handleUpdateQuantity(item.quantity - 1)}
              >
                {' '}
                <Minus className="h-6 w-6" />
              </Button>
            )}
            <div className="w-15 h-13 py-3 border-y border-neutral-300 text-center py-1">
              {isProcessing ? (
                <div className="animate-pulse h-4 w-4 mx-auto bg-muted rounded-full"></div>
              ) : (
                item.quantity
              )}
            </div>
            <Button
              variant="secondary"
              size="icon"
              className="p-3 h-13 border-neutral-300 rounded-none rounded-ee-sm rounded-se-sm"
              disabled={isProcessing}
              onClick={() => handleUpdateQuantity(item.quantity + 1)}
            >
              <Plus className="h-6 w-6" />
            </Button>
          </div>
        </div>
        <div className="col-start-2 row-start-2 md:col-start-4 md:row-start-1 md:row-end-3 lg:col-start-4 flex flex-col gap-1 ps-4 md:ps-0">
          {isStrike && (
            <p className={cn('line-through md:text-end', isStrike && 'text-danger-500')}>
              {formatCurrency(item.price.amount, item.price.currency)}
            </p>
          )}
          <div className="font-bold md:text-end">{formatCurrency(item.price.amount, item.price.currency)}</div>
          {item.tax?.netValue && (
            <span className="text-xs text-neutral-300 md:text-end">
              {t('net')}
              {formatCurrency(item.tax?.netValue, item.price.currency)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
