'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QuantityStepper } from '@/components/ui/molecules/quantity-stepper';
import { useL10n } from '@/hooks/useL10n';
import { Link } from '@/i18n/navigation';
import { formatCurrency } from '@/lib/utils';
import type { Product } from '@/platform/services/model/product';

interface QuickOrderProductCardProps {
  product: Product;
  quantity: number;
  onRemove: () => void;
  onUpdateQuantity: (quantity: number) => void;
}

export function QuickOrderProductCard({ product, quantity, onRemove, onUpdateQuantity }: QuickOrderProductCardProps) {
  const { l10n } = useL10n();
  const tCart = useTranslations('cart');
  const image = product.images?.[0];
  const brandName = l10n(product.brand?.name || '');
  const productName = l10n(product.name) || '';
  const itemNumber = product.sku || product.id;

  return (
    <div className="py-4 border-b border-border-primary first:border-t-0" data-testid={`product-card-${product.id}`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-[100px] h-[65px] rounded-ss-md rounded-ee-md overflow-hidden bg-surface-image-background flex items-center justify-center">
          {image?.url ? (
            <Image
              src={image.url}
              alt={l10n(image.altText || '') || productName}
              width={100}
              height={65}
              className="object-contain w-[100px] h-[65px]"
            />
          ) : (
            <Image
              src="/images/no_image_alt.png"
              alt={productName}
              width={100}
              height={65}
              className="object-contain"
            />
          )}
        </div>

        <div className="flex-1 min-w-0">
          {brandName && <p className="text-xs text-text-placeholders">{brandName}</p>}
          <Link
            href={`/product/${product.id}`}
            className="text-sm font-headlines font-bold text-text-body hover:underline line-clamp-2"
          >
            {productName}
          </Link>
          <p className="text-xs text-text-placeholders">{itemNumber}</p>

          {product.price && (
            <div className="mt-1">
              {product.price.originalAmount && product.price.originalAmount > product.price.amount && (
                <p className="text-xs text-text-placeholders line-through">
                  {formatCurrency(product.price.originalAmount, product.price.currency)}
                </p>
              )}
              <p className="text-sm font-bold font-headlines">
                {formatCurrency(product.price.tax?.netValue || product.price.amount, product.price.currency)}
              </p>
              {product.price.tax?.netValue && (
                <span className="text-xs text-text-on-disabled">
                  {tCart('gross')}
                  {formatCurrency(product.price.tax.grossValue, product.price.currency)}
                </span>
              )}
            </div>
          )}
        </div>

        <Button
          variant="link"
          size="icon"
          onClick={onRemove}
          aria-label="Remove product"
          className="flex-shrink-0"
          data-testid={`remove-product-${product.id}`}
        >
          <Trash2 className="h-4 w-4 text-icon-secondary" />
        </Button>
      </div>

      <div className="mt-3 flex justify-start">
        <QuantityStepper value={quantity} onChange={onUpdateQuantity} size="sm" />
      </div>
    </div>
  );
}
