import { useTranslations } from 'next-intl';
import { ArrowRight, Package } from 'lucide-react';
import { Cart } from '@/platform/services/model/cart';
import { CardContent } from '../ui/card';
import UiLink from '../ui/link';

interface CartSummaryProps {
  cart: Cart;
}
export function CartFreeship({ cart }: CartSummaryProps) {
  const t = useTranslations('cart');
  const freeShippingValue = 400;

  return (
    <CardContent className="flex flex-col gap-4 bg-primary-50 rounded-md p-4">
      <div className="flex gap-2 text-primary-500">
        <Package />
        <div className="font-bold text-neutral-900">
          {(freeShippingValue - cart.totalPrice.amount).toFixed(2) + t('untilFreeShipping')}
        </div>
      </div>
      <div className="rounded-xl h-4 border border-primary-800">
        <div
          className="bg-gradient-to-t from-primary-700 to-primary-500 rounded-[inherit] h-full"
          style={{ width: ((100 / freeShippingValue) * cart.totalPrice.amount).toFixed(0) + '%' }}
        ></div>
      </div>
      <span className="text-primary-500">{t('freeShippingOn')}</span>
      <UiLink type="Link" href="#" variant="primary" size="m" iconAfter={<ArrowRight />}>
        {t('continueShopping')}
      </UiLink>
    </CardContent>
  );
}
