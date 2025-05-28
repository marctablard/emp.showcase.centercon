import { useCart } from '@/hooks/cart/useCart';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { CartItemRow } from '@/components/cart/cart-item';
import { getTranslations } from 'next-intl/server';
import { getCurrentCart } from '@/lib/ssr/carts';

export default async function CartPage() {
  const t = await getTranslations('cart');
  const cart = await getCurrentCart();

  if (!cart || cart.items.length === 0) {
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

  return (
    <div className="container mx-auto py-16 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-8">{t('yourCart')}</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>{t('items')}</CardTitle>
                <Badge variant="outline">{cart?.items.length} {t('items')}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">{t('product')}</TableHead>
                    <TableHead>{t('details')}</TableHead>
                    <TableHead className="text-right">{t('price')}</TableHead>
                    <TableHead className="text-center">{t('quantity')}</TableHead>
                    <TableHead className="text-right">{t('total')}</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cart.items.map((item) => (
                    <CartItemRow 
                      key={item.id}
                      cart={cart}
                      item={item}
                    />
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Link href="/">
                <Button variant="outline">{t('continueShopping')}</Button>
              </Link>
            </CardFooter>
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
                  <span>{formatCurrency(cart.subTotalPrice.amount, cart.subTotalPrice.currency)}</span>
                </div>
                
                {/* Add shipping, tax, etc. if available */}
                
                <div className="flex justify-between font-medium text-lg pt-4 border-t">
                  <span>{t('total')}</span>
                  <span>{formatCurrency(cart.totalPrice.amount, cart.totalPrice.currency)}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Link href="/checkout" className="w-full">
                {t('checkout')}
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
