'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { LucideMinus, LucidePlus, LucideShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input, InputButton } from '@/components/ui/input';
import { useCart } from '@/hooks/cart/useCart';
import { useProduct } from '@/hooks/product/useProduct';
import { cn } from '@/lib/utils';
import { Product } from '@/platform/services/model/product';

// Client component that uses the product signal
export default function ProductAddToCart({
  product: initialProduct,
  className,
}: {
  product?: Product;
  className?: string;
}) {
  const t = useTranslations('product');
  const { product, loading: productLoading, error: productError } = useProduct(initialProduct);
  const { addItem, loading: cartLoading } = useCart();
  const [quantity, setQuantity] = useState(1);

  if (productLoading) {
    return (
      <div className={cn('flex items-center justify-center p-6 space-x-2', className)}>
        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary"></div>
        <span className="text-muted-foreground">Loading...</span>
      </div>
    );
  }

  if (productError) {
    return (
      <div className={cn('p-4 border border-destructive/20 rounded-md bg-destructive/10 text-destructive', className)}>
        <p className="text-sm font-medium">Error loading product: {productError.message}</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className={cn('p-4 border rounded-md bg-muted/50 text-muted-foreground', className)}>
        <p className="text-sm">Product not found</p>
      </div>
    );
  }

  const handleAddToCart = async () => {
    try {
      if (!product) return;

      await addItem(product.id, quantity);

      toast.success(t('addedToCart'), {
        description: `${quantity} × ${product.name} ${t('addedToCartDescription')}`,
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error(t('errorAddingToCart'), {
        description: error instanceof Error ? error.message : String(error),
      });
    }
  };

  const handleBuyNow = async () => {
    return false;
  };

  const incrementQuantity = () => {
    if (quantity < 99) setQuantity(quantity + 1);
  };

  const decrementQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 1 && value <= 99) {
      setQuantity(value);
    }
  };

  return (
    <div className={cn('w-full flex items-center gap-2', className)}>
      <div className="flex items-center">
        <Button
          variant="secondary"
          size="icon"
          className="rounded-tr-none rounded-br-none"
          onClick={decrementQuantity}
          title={t('decrement')}
          disabled={quantity <= 1}
        >
          <LucideMinus />
        </Button>
        <Input
          id="quantity"
          type="number"
          min="1"
          title={t('quantity')}
          className="text-center rounded-none w-16 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          value={quantity}
          onChange={handleQuantityChange}
        />
        <Button
          variant="secondary"
          size="icon"
          className="rounded-tl-none rounded-bl-none"
          title={t('increment')}
          onClick={incrementQuantity}
        >
          <LucidePlus />
        </Button>
      </div>

      <Button className="flex-1" onClick={handleAddToCart} disabled={cartLoading}>
        <LucideShoppingCart />
        {t('addToCart')}
        <LucideShoppingCart />
      </Button>
    </div>
  );
}
