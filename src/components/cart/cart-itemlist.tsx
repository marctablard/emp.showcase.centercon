import { useTranslations } from 'next-intl';
import { Cart } from '@/platform/services/model/cart';
import { Card, CardContent, CardHeader } from '../ui/card';
import { CartItemRow } from './cart-item';

interface CartItemListProps {
  cart: Cart;
}

export function CartItemList({ cart }: CartItemListProps) {
  const t = useTranslations('cart');

  return (
    <Card className="p-0 shadow-sm border-none lg:mb-6 gap-3">
      <CardHeader className="pt-6 hidden md:block">
        <div className="grid grid-cols-[1fr_2fr] sm:grid-cols-[120px_3fr] md:grid-cols-[120px_3fr_1fr_1fr] lg:grid-cols-[120px_2fr_2fr_1fr] xl:grid-cols-[120px_3fr_1.5fr_2fr] 2xl:grid-cols-[120px_4fr_1fr_1fr]">
          <p className="col-start-1 col-end-3 font-bold font-headlines">{t('product')}</p>
          <p className="col-start-2 row-start-4 md:col-start-3 md:col-end-3 md:row-start-1 lg:col-start-3 font-bold font-headlines">
            {t('qty')}
          </p>
          <p className="col-start-4 xl:col-start-4 font-bold font-headlines text-end">{t('price')}</p>
        </div>
      </CardHeader>
      <CardContent className="px-6">
        {cart?.items.map((item) => <CartItemRow key={item.id} cart={cart} item={item} showQty={true} />)}
      </CardContent>
    </Card>
  );
}
