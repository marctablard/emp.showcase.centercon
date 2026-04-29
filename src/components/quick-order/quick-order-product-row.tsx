'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Package, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QuantityStepper } from '@/components/ui/molecules/quantity-stepper';
import { useAvailability } from '@/hooks/product/useAvailability';
import { useL10n } from '@/hooks/useL10n';
import { Link } from '@/i18n/navigation';
import { formatCurrency } from '@/lib/utils';
import type { Product } from '@/platform/services/model/product';

function HighlightedText({ text }: { text: string }) {
  if (!text.includes('<mark>')) {
    return <>{text}</>;
  }
  const parts = text.split(/<mark>|<\/mark>/);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 0 ? (
          part
        ) : (
          <span key={i} className="font-bold text-text-action">
            {part}
          </span>
        ),
      )}
    </>
  );
}

interface QuickOrderProductRowProps {
  product: Product;
  quantity: number;
  onRemove: () => void;
  onUpdateQuantity: (quantity: number) => void;
}

export function QuickOrderProductRow({ product, quantity, onRemove, onUpdateQuantity }: QuickOrderProductRowProps) {
  const { l10n } = useL10n();
  const tCart = useTranslations('cart');
  const { availability } = useAvailability(product.id);
  const image = product.images?.[0];
  const brandName = l10n(product.brand?.name || '');
  const productName = l10n(product.name) || '';
  const itemNumber = product.sku || product.id;

  return (
    <tr className="border-b border-border-primary" data-testid={`product-row-${product.id}`}>
      <td className="py-4 pr-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-[80px] h-[52px] rounded-ss-md rounded-ee-md overflow-hidden bg-surface-image-background flex items-center justify-center">
            {image?.url ? (
              <Image
                src={image.url}
                alt={l10n(image.altText || '') || productName}
                width={80}
                height={52}
                className="object-contain w-[80px] h-[52px]"
              />
            ) : (
              <Image
                src="/images/no_image_alt.png"
                alt={productName}
                width={80}
                height={52}
                className="object-contain"
              />
            )}
          </div>
          <div className="min-w-0">
            {brandName && (
              <p className="text-sm text-text-placeholders">
                <HighlightedText text={brandName} />
              </p>
            )}
            <Link
              href={`/product/${product.id}`}
              className="font-bold text-base font-headlines text-text-body hover:underline line-clamp-2"
            >
              <HighlightedText text={productName} />
            </Link>
            <p className="text-sm">
              {tCart('itemNumber')}: {itemNumber}
            </p>
            <div className="flex items-center gap-1 mt-1">
              {availability ? (
                availability.availableQuantity > 0 ? (
                  <>
                    <Package className="h-4 w-4 text-icon-success" />
                    <span className="text-sm text-text-success">{tCart('available')}</span>
                  </>
                ) : (
                  <>
                    <Package className="h-4 w-4 text-icon-error" />
                    <span className="text-sm text-text-error">
                      {tCart('substitution.availableDescription', { available: 0, total: 1 })}
                    </span>
                  </>
                )
              ) : (
                <>
                  <Package className="h-4 w-4 text-icon-success" />
                  <span className="text-sm text-text-success">{tCart('available')}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </td>

      <td className="py-4 px-4">
        <div className="w-fit">
          <QuantityStepper
            value={quantity}
            onChange={onUpdateQuantity}
            size="md"
            max={availability?.availableQuantity}
          />
        </div>
      </td>

      <td className="py-4 px-4 text-right">
        {product.price && (
          <div>
            {product.price.originalAmount && product.price.originalAmount > product.price.amount && (
              <p className="text-sm text-text-error line-through">
                {formatCurrency(product.price.originalAmount, product.price.currency)}
              </p>
            )}
            <p className="font-bold">
              {formatCurrency(product.price.tax?.netValue || product.price.amount, product.price.currency)}
            </p>
            {product.price.tax?.netValue && (
              <span className="text-sm text-text-on-disabled">
                {tCart('gross')}
                {formatCurrency(product.price.tax.grossValue, product.price.currency)}
              </span>
            )}
          </div>
        )}
      </td>

      <td className="py-4 pl-4">
        <Button
          variant="link"
          size="icon"
          onClick={onRemove}
          aria-label="Remove product"
          data-testid={`remove-product-${product.id}`}
        >
          <Trash2 className="h-6 w-6 text-icon-secondary" />
        </Button>
      </td>
    </tr>
  );
}
