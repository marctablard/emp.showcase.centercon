'use client';

import { useState } from 'react';
import { useProduct } from '@/hooks/product/useProduct';
import { useCart } from '@/hooks/cart/useCart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Product } from '@/platform/services/model/product';

// Client component that uses the product signal
export default function ProductActions({product : initialProduct}: {product?: Product}) {
  const t = useTranslations('product');
  const { product, loading: productLoading, error: productError } = useProduct(initialProduct);
  const { addItem, loading: cartLoading } = useCart();
  const [quantity, setQuantity] = useState(1);

  if (productLoading) {
    return (
      <div className="flex items-center justify-center p-6 space-x-2">
        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary"></div>
        <span className="text-muted-foreground">Loading...</span>
      </div>
    );
  }
  
  if (productError) {
    return (
      <div className="p-4 border border-destructive/20 rounded-md bg-destructive/10 text-destructive">
        <p className="text-sm font-medium">Error loading product: {productError.message}</p>
      </div>
    );
  }
  
  if (!product) {
    return (
      <div className="p-4 border rounded-md bg-muted/50 text-muted-foreground">
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
  }

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
    <div className="w-full space-y-6">
      <div className="flex items-center space-x-2">
        <div className="flex items-center">
          <Button 
            variant="outline" 
            size="icon" 
            className="h-9 w-9 rounded-r-none"
            onClick={decrementQuantity}
            disabled={quantity <= 1}
          >
            -
          </Button>
          <Input
            id="quantity"
            type="number"
            min="1"
            title={t('quantity')}
            className="w-12 h-9 text-center rounded-none border-x-0"
            value={quantity}
            onChange={handleQuantityChange}
          />
          <Button 
            variant="outline" 
            size="icon" 
            className="h-9 w-9 rounded-l-none"
            onClick={incrementQuantity}
          >
            +
          </Button>
        </div>
      </div>
      
      <Button
        className="w-half"
        onClick={handleAddToCart}
        variant="default"
        size="lg"
        disabled={cartLoading}
      >
        {t('addToCart')}
      </Button>

      <Button
        className="w-half"
        onClick={handleBuyNow}
        variant="outline"
        size="lg"
        disabled={cartLoading}
      >
        {t('buyNow')}
      </Button>
      
      <div className="text-sm text-muted-foreground">
        <p>{t('productId')}: {product.id}</p>
      </div>
    </div>
  );
}
