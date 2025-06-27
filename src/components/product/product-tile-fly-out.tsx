import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { formatCurrency } from '@/lib/utils';
import { LocalizedString } from '@/platform/services/model/common';
import { Product } from '@/platform/services/model/product';
import MarkedText from '../header/common/search/marked-text';

interface ProductTileProps {
  product: Product;
  className?: string;
  locale?: string;
}

const getLocalizedString = (locale: string) => (value: string | LocalizedString) =>
  typeof value === 'string' ? value : value[locale];

// Helper function to capitalize words and format text
const formatText = (text: string): string => {
  return text
    .replace(/-/g, ' ')
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Helper function to render product attributes
const renderAttributes = (attributes: Record<string, string>, maxItems?: number, isBold?: boolean) => {
  const entries = Object.entries(attributes);
  const limitedEntries = maxItems ? entries.slice(0, maxItems) : entries;

  return limitedEntries.map(([key, value]) => (
    <p key={key} className={`text-sm ${isBold ? 'font-bold' : ''}`}>
      {formatText(key)}: {formatText(value)}
    </p>
  ));
};

export function ProductTileFlyOut({ product, locale = 'de' }: ProductTileProps) {
  const getLocalized = getLocalizedString(locale);
  const [image] = product.images || [];
  return (
    <Link href={`/product/${product.id}`}>
      <div className="flex">
        {product.images && (
          <div className="mr-3 bg-gray-100 w-[100px] h-[144px] rounded-tl-md rounded-br-md flex align-center justify-center">
            {image && (
              <Image
                className="object-contain"
                src={image?.url}
                height={90}
                width={90}
                alt={getLocalized(image?.altText || '') || ''}
              />
            )}
          </div>
        )}
        <div id="details text-md">
          <p>{getLocalized(product.brand?.name ?? '')}</p>
          <MarkedText text={getLocalized(product.name)} />
          <p className="text-sm font-bold">
            {product.price && formatCurrency(product.price.amount, product.price.currency)}
          </p>
          {(() => {
            // Calculate how many attributes to show in total (max 3)
            const maxTotalAttributes = 4;
            const variantAttributes = product.mixins?.productVariantAttributes as Record<string, string> | undefined;
            const templateAttributes = product.mixins?.productTemplateAttributes as Record<string, string> | undefined;

            // Count variant attributes (if any)
            const variantCount = variantAttributes ? Object.keys(variantAttributes).length : 0;
            // Calculate how many template attributes we can show
            const templateCount = Math.max(0, maxTotalAttributes - variantCount);

            return (
              <>
                {variantAttributes && renderAttributes(variantAttributes, Math.min(maxTotalAttributes, variantCount))}
                {templateAttributes && templateCount > 0 && renderAttributes(templateAttributes, templateCount)}
              </>
            );
          })()}
        </div>
      </div>
    </Link>
  );
}
