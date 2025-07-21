import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Cart, CartUpdate } from '@platform/services/model/cart';
import { MessageCircleWarning, ShoppingCart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useL10n } from '@/hooks/useL10n';
import { formatCurrency } from '@/lib/utils';

interface HeaderMiniCartItemListProps {
  cart?: Cart | null;
  cartUpdate?: CartUpdate;
}

export function HeaderMiniCartItemList({ cart, cartUpdate }: HeaderMiniCartItemListProps) {
  const t = useTranslations('cart');
  const { l10n } = useL10n();
  const router = useRouter();

  return (
    <>
      {cart?.items?.map((item) => (
        <div key={item.id} className={`pt-4 first:pt-0 pb-4 border-b flex items-end justify-between gap-3`}>
          <div className="flex gap-4">
            <div className="rounded-ss-xl rounded-ee-xl w-[100px] h-[65px] object-fit overflow-hidden">
              {item.product && item.product.images?.length ? (
                <Image
                  width={100}
                  height={65}
                  src={String(item.product.images[0].url)}
                  alt={String(item.product.name || 'Product')}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <ShoppingCart className="h-6 w-6 opacity-30" />
                </div>
              )}
            </div>
            <div className="flex-grow min-w-0">
              <p className="text-sm">{l10n(item.product?.brand?.name || 'Brand')}</p>
              <p
                className="font-bold truncate font-headlines cursor-pointer"
                onClick={() => router.push(`/product/${item.product?.id}`)}
              >
                {l10n(item.product?.name || 'Product')}
              </p>
              <div className="flex items-center">
                <p className="text-xs border-r border-neutral-200 pr-4">
                  {t('itemNumber')} {item.product?.id}
                </p>
                <p className="text-xs pl-4">
                  {t('qty')}: {item.quantity}
                </p>
              </div>
            </div>
          </div>
          <div>
            {cartUpdate?.itemId === item.id && (
              <Badge variant="warning" className="h-5 min-w-5 rounded-full px-1 tabular-nums tracking-normal">
                <MessageCircleWarning />
              </Badge>
            )}
            <p className={`font-bold font-headlines ${cartUpdate?.itemId === item.id ? 'bg-orange-100/75' : ''}`}>
              {formatCurrency(item.price.amount, item.price.currency)}
            </p>
          </div>
        </div>
      ))}
    </>
  );
}
