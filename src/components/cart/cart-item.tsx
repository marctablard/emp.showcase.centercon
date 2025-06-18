'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/cart/useCart';
import { useL10n } from '@/hooks/useL10n';
import { formatCurrency } from '@/lib/utils';
import { Cart, CartItem } from '@/platform/services/model/cart/cart.d';
import { Badge } from '../ui/badge';

interface CartItemProps {
  cart: Cart;
  item: CartItem;
}

export function CartItemRow({ cart, item }: CartItemProps) {
  const { l10n } = useL10n();
  const t = useTranslations('cart');
  const { updateItemQuantity, removeItem } = useCart(cart);
  const [isProcessing, setIsProcessing] = useState(false);

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
    <div className="grid grid-cols-7 py-6 border-t border-neutral-200">
      <div className="col-span-5 flex">
        <div className="rounded-ss-xl rounded-ee-xl  w-[120px] h-[78px] object-fit overflow-hidden">
          {item.product && item.product.images?.length ? (
            <Image
              width={120}
              height={78}
              src={String(item.product.images[0].url)}
              alt={String(item.product.name || 'Product')}
              className="rounded-ss-xl-[inherit] rounded-ee-xl-[inherit]"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <ShoppingCart className="h-8 w-8 opacity-30" />
            </div>
          )}
        </div>
        <div className="flex flex-col gap-1 px-4">
          <p className="">Serie GMV</p>
          <div className="flex flex-col gap-2">
            <p className="font-bold text-base">{l10n(item.product?.name || 'Product')}</p>
            <p className="text-sm">Item Number bla</p>
            <p className="text-sm text-success-500">Online Available</p>
            <p className="text-sm text-primary-500 font-bold">Add to Wishlist</p>
          </div>
        </div>
      </div>
      <div className="col-span-1 gap-4 items-end">
        <div className="flex">
          <Button
            variant="secondary"
            size="icon"
            className="h-8 w-8 border-neutral-300 rounded-none rounded-ss-sm rounded-es-sm"
            disabled={isProcessing || item.quantity <= 1}
            onClick={() => handleUpdateQuantity(item.quantity - 1)}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="mx-3 w-8 text-center">
            {isProcessing ? <div className="animate-pulse h-4 w-4 mx-auto bg-muted rounded-full"></div> : item.quantity}
          </span>
          <Button
            variant="secondary"
            size="icon"
            className="h-8 w-8 border-neutral-300 rounded-none rounded-ee-sm rounded-se-sm"
            disabled={isProcessing}
            onClick={() => handleUpdateQuantity(item.quantity + 1)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {/* <div>
          <Button
            variant="link"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive/90"
            disabled={isProcessing}
            onClick={handleRemoveItem}
          >
            {isProcessing ? (
              <div className="animate-spin h-4 w-4 border-2 border-destructive/50 border-t-transparent rounded-full"></div>
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        </div> */}
      </div>
      <div className="col-span-1 gap-4 flex justify-end py-4">
        <div className="flex flex-col gap-1">
          <p className="line-through text-end">{formatCurrency(item.price.amount, item.price.currency)}</p>
          <div className="font-bold text-end">{formatCurrency(item.price.amount, item.price.currency)}</div>
          <span className="text-xs text-neutral-300 text-end">
            {t('net')}
            {formatCurrency(item.price.amount, item.price.currency)}
          </span>
        </div>
      </div>
    </div>
  );
}
