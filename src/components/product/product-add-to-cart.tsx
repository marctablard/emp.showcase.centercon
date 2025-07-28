'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { LucideMinus, LucidePlus, LucideShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCart } from '@/hooks/cart/useCart';
import { useProduct } from '@/hooks/product/useProduct';
import { cn } from '@/lib/utils';
import { ProductPrice } from '@/platform/services/model/price';
import { Product } from '@/platform/services/model/product';

// Client component that uses the product signal
export default function ProductAddToCart({
  product: initialProduct,
  price,
  isAddToCartBar,
  className,
}: {
  product?: Product;
  price?: ProductPrice | null;
  isAddToCartBar?: boolean;
  className?: string;
}) {
  const t = useTranslations('product');
  const { product, loading: productLoading, error: productError } = useProduct(initialProduct);
  const { addItem, cart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

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
      setAdding(true);
      await addItem(product.id, quantity);

      toast.success(t('addedToCart'), {
        description: `${quantity} × ${product.name} ${t('addedToCartDescription')}`,
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error(t('errorAddingToCart'), {
        description: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setAdding(false);
    }
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
    <>
      {!isAddToCartBar && (
        <div className="col-start-1 row-start-2 md:col-start-2 md:row-start-1 md:content-end lg:row-start-2 lg:col-start-1">
          <div className="flex items-center w-full">
            <Button
              variant="secondary"
              size="icon"
              className="rounded-tr-none rounded-br-none"
              onClick={decrementQuantity}
              aria-label={t('decrement')}
              disabled={quantity <= 1}
            >
              <LucideMinus />
            </Button>
            <Input
              id="quantity"
              type="number"
              min="1"
              aria-label={t('quantity')}
              className="w-full text-center rounded-none lg:min-w-16 md:[appearance:textfield] md:[&::-webkit-outer-spin-button]:appearance-none md:[&::-webkit-inner-spin-button]:appearance-none"
              value={quantity}
              onChange={handleQuantityChange}
            />
            <Button
              variant="secondary"
              size="icon"
              className="rounded-tl-none rounded-bl-none"
              aria-label={t('increment')}
              onClick={incrementQuantity}
            >
              <LucidePlus />
            </Button>
          </div>
        </div>
      )}
      <div className="col-start-1 row-start-3 md:row-start-2 md:col-end-3 lg:col-start-2 lg:col-end-5 lg-row-start-2 gap-4 lg:ps-4 xl:ps-0">
        <Button
          className={cn(
            'flex-1 w-full mt-4 md:mt-0',
            isAddToCartBar && 'h-14 bg-white text-primary-500 hover:bg-white hover:text-primary-700',
          )}
          onClick={handleAddToCart}
          disabled={cart === undefined || adding || !price}
        >
          {!isAddToCartBar && <LucideShoppingCart />}
          {t('addToCart')}
          <LucideShoppingCart className="hidden md:inline" />
        </Button>
      </div>
    </>
  );
}
