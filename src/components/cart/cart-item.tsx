'use client';

import { useState } from 'react';
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
    <div className="flex justify-between my-4 border-t first:border-none">
      <div className="flex gap-2">
        {item.product && item.product.images?.length ? (
          <Image
            src={String(item.product.images[0].url)}
            alt={String(item.product.name || 'Product')}
            className="w-40 h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <ShoppingCart className="h-8 w-8 opacity-30" />
          </div>
        )}
        <div className="flex flex-col gap-2 p-4">
          <p className="font-bold text-xl">{l10n(item.product?.name || 'Product')}</p>
          <Badge className="mb-2 bg-cyan-500 hover:bg-cyan-600">In Stock</Badge>
        </div>
      </div>
      <div className="flex flex-col gap-4 items-end py-4">
        <div className="font-bold">{formatCurrency(item.price.amount, item.price.currency)}</div>
        <div className="flex items-center justify-center">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={isProcessing || item.quantity <= 1}
            onClick={() => handleUpdateQuantity(item.quantity - 1)}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="mx-3 w-8 text-center">
            {isProcessing ? <div className="animate-pulse h-4 w-4 mx-auto bg-muted rounded-full"></div> : item.quantity}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={isProcessing}
            onClick={() => handleUpdateQuantity(item.quantity + 1)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div>
          <Button
            variant="ghost"
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
        </div>
      </div>
    </div>
  );
}
