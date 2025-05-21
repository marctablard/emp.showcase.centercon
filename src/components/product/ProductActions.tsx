'use client';

import { useState } from 'react';
import { useProduct } from '@/hooks/product/useProduct';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTranslations } from 'next-intl';

// Client component that uses the product signal
export default function ProductActions({id}: {id: string}) {
  const t = useTranslations('product');
  const { product, loading, error } = useProduct(id);
  const [quantity, setQuantity] = useState(1);

  // If product is not available yet, show loading
  if (loading) {
    return (
      <div className="flex items-center justify-center p-6 space-x-2">
        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary"></div>
        <span className="text-muted-foreground">Loading...</span>
      </div>
    );
  }
  
  // If there's an error, show error message
  if (error) {
    return (
      <div className="p-4 border border-destructive/20 rounded-md bg-destructive/10 text-destructive">
        <p className="text-sm font-medium">Error loading product: {error.message}</p>
      </div>
    );
  }
  
  // If no product, show not found
  if (!product) {
    return (
      <div className="p-4 border rounded-md bg-muted/50 text-muted-foreground">
        <p className="text-sm">Product not found</p>
      </div>
    );
  }
  
  const handleAddToCart = () => {
    // Here you would implement your cart logic
    alert(`Added ${quantity} of ${product.name} to cart!`);
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
    <div className="w-full space-y-6">
      <div className="flex items-center space-x-2">
        <label htmlFor="quantity" className="text-sm font-medium">
          {t('quantity')}:
        </label>
        <div className="flex items-center">
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8 rounded-r-none"
            onClick={decrementQuantity}
            disabled={quantity <= 1}
          >
            -
          </Button>
          <Input
            id="quantity"
            type="number"
            min="1"
            max="99"
            className="h-8 w-14 rounded-none text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            value={quantity}
            onChange={handleQuantityChange}
          />
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8 rounded-l-none"
            onClick={incrementQuantity}
            disabled={quantity >= 99}
          >
            +
          </Button>
        </div>
      </div>
      
      <Button
        className="w-full"
        onClick={handleAddToCart}
        variant="default"
        size="lg"
      >
        {t('addToCart')}
      </Button>
      
      <div className="text-sm text-muted-foreground">
        <p>{t('productId')}: {product.id}</p>
      </div>
    </div>
  );
}
