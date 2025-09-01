import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Package } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Button } from '../ui/button';
import type { ProductListItem } from './product-list';

interface ProductItemRowProps {
  item: ProductListItem;
  showNetUnderGross?: boolean;
}

export function ProductItemRow({ item, showNetUnderGross = false }: ProductItemRowProps) {
  const t = useTranslations('cart');
  return (
    <div className="py-6 first:border-none border-t border-neutral-200 md:first:border-solid">
      <div className="grid grid-cols-[1fr_2fr] sm:grid-cols-[120px_3fr] md:grid-cols-[120px_3fr_1fr_1fr] lg:grid-cols-[120px_2fr_2fr_1fr] xl:grid-cols-[120px_3fr_1.5fr_2fr] 2xl:grid-cols-[120px_4fr_1fr_1fr]">
        <div className="col-start-1 row-start-2  md:row-start-1 row-end-3">
          <div className="rounded-ss-xl rounded-ee-xl w-[100px] h-[65px] sm:w-[120px] sm:h-[78px] object-fit overflow-hidden bg-neutral-100">
            {item.imageUrl ? (
              <Image
                width={120}
                height={78}
                src={String(item.imageUrl)}
                alt={String(item.name)}
                className="rounded-ss-xl-[inherit] rounded-ee-xl-[inherit] w-[100px] h-[65px] sm:w-[120px] sm:h-[78px] object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                {item.itemNumber || 'Item'}
              </div>
            )}
          </div>
        </div>

        <div className="col-start-1 col-end-3 row-start-1 md:col-start-2 flex flex-col gap-1 mb-4 md:mb-0 md:mx-4">
          {item.brand && <p className="text-sm md:text-base">{item.brand}</p>}
          {item.href ? (
            <a href={item.href} className="font-bold text-base font-headlines text-primary-600 hover:underline">
              {item.name}
            </a>
          ) : (
            <p className="font-bold text-base font-headlines">{item.name}</p>
          )}
          {item.itemNumber && <p className="text-xs text-muted-foreground">{item.itemNumber}</p>}
          <div className="flex flex-col gap-1 mt-1">
            <div className="flex items-center gap-1">
              <div className="text-success-500">
                <Package className="h-4 w-4" />
              </div>
              <p className="text-sm text-success-500">{t('available')}</p>
            </div>
            <Button
              variant="link"
              size="small"
              className="normal-case text-sm tracking-normal p-0 justify-start self-start"
            >
              {t('addToWishlist')}
            </Button>
          </div>
        </div>

        <div className="col-start-2 row-start-4 md:col-start-3 md:col-end-3 md:row-start-1 lg:col-start-3 flex items-start md:items-center md:justify-start">
          <p className="text-sm md:text-base">{item.quantity}</p>
        </div>

        <div className="col-start-2 row-start-2 md:col-start-4 md:row-start-1 md:row-end-3 lg:col-start-4 flex flex-col gap-1 ps-4 md:ps-0">
          <div className="font-bold md:text-end">{formatCurrency(item.unitPrice, item.currency)}</div>
          {showNetUnderGross && (
            <span className="text-xs text-neutral-300 md:text-end">
              {/* Placeholder for net value if caller wants to provide it in future */}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
