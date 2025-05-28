'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils';
import { Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react';
import { CartItem, Cart } from '@/platform/services/model/cart/cart.d';
import { useTranslations } from 'next-intl';
import { useCart } from '@/hooks/cart/useCart';
import { useL10n } from '@/hooks/useL10n';

interface CartItemProps {
  cart: Cart;
  item: CartItem;
}

export function CartItemRow({ cart, item }: CartItemProps) {
  const t = useTranslations('cart');
  const { l10n } = useL10n();
  const { loading, updateItemQuantity, removeItem } = useCart(cart);
  const [isProcessing, setIsProcessing] = useState(false);
  const itemTotal = item.price.amount * item.quantity;

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
    <TableRow>
      <TableCell className="align-middle">
        <div className="w-20 h-20 bg-muted rounded overflow-hidden">
          {item.product && item.product.images?.length ? (
            <img 
              src={String(item.product.images[0].url)} 
              alt={String(item.product.name || 'Product')} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <ShoppingCart className="h-8 w-8 opacity-30" />
            </div>
          )}
        </div>
      </TableCell>
      <TableCell>
        <div>
          <p className="font-medium">{l10n(item.product?.name || 'Product')}</p>
          <p className="text-sm text-muted-foreground">{item.product?.id}</p>
        </div>
      </TableCell>
      <TableCell className="text-right">
        {formatCurrency(item.price.amount, item.price.currency)}
      </TableCell>
      <TableCell>
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
            {isProcessing ? (
              <div className="animate-pulse h-4 w-4 mx-auto bg-muted rounded-full"></div>
            ) : (
              item.quantity
            )}
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
      </TableCell>
      <TableCell className="text-right font-medium">
        {formatCurrency(itemTotal, item.price.currency)}
      </TableCell>
      <TableCell>
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
      </TableCell>
    </TableRow>
  );
}
