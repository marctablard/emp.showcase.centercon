'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { useCart } from '@/hooks/cart/useCart';
import { formatCurrency } from '@/lib/utils';
import { Cart } from '@/platform/services/model/cart/cart';
import { CartItemRow } from './cart-item';

interface CartOverviewProps {
  initialCart?: Cart | null;
}

export function CartOverview({ initialCart }: CartOverviewProps) {
  const t = useTranslations('cart');
  const { cart, loading } = useCart(initialCart);

  if (loading) {
    return (
      <div className="container mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <Card className="mx-auto max-w-3xl">
          <CardHeader>
            <CardTitle className="text-center text-2xl">{t('yourCart')}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Spinner variant="lg" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (cart && cart.items.length > 0) {
    return (
      <div className="container mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-8">{t('yourCart')}</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="py-0">
              <CardContent className="px-4">
                {cart?.items.map((item) => <CartItemRow key={item.id} cart={cart} item={item} />)}
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>{t('orderSummary')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('subtotal')}</span>
                    <span>{formatCurrency(cart?.subTotalPrice.amount, cart?.subTotalPrice.currency)}</span>
                  </div>

                  {/* Add shipping, tax, etc. if available */}

                  <div className="flex justify-between font-medium text-lg pt-4 border-t">
                    <span>{t('total')}</span>
                    <span>{formatCurrency(cart.totalPrice.amount, cart.totalPrice.currency)}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Link
                  href={'/checkout'}
                  className="bg-primary rounded-md text-sm font-medium  no-underline text-white p-3"
                >
                  {t('checkout')}
                </Link>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="container mx-auto py-16 px-4 sm:px-6 lg:px-8">
      <Card className="mx-auto max-w-3xl">
        <CardHeader>
          <CardTitle className="text-center text-2xl">{t('yourCart')}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-xl text-muted-foreground mb-6">{t('emptyCart')}</p>
          <Link href="/">
            <Button size="lg">{t('continueShopping')}</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
