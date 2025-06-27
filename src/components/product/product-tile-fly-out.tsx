import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { formatCurrency, l10n } from '@/lib/utils';
import { Product } from '@/platform/services/model/product';
import MarkedText from '../header/common/search/marked-text';

interface ProductTileProps {
  product: Product;
  className?: string;
  locale?: string;
}

// Helper function to capitalize words and format text
const formatAttributeKey = (text: string): string => {
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
      {formatAttributeKey(key)}: {value}
    </p>
  ));
};

// Helper function to extract dimensions (height, width, length) from attributes
const extractDimensions = (attributes: Record<string, string>) => {
  const height = attributes['height'];
  const width = attributes['width'];
  const length = attributes['length'];

  if (height || width || length) {
    const dimensions = [];
    if (height) dimensions.push(`H: ${formatAttributeKey(height)}`);
    if (width) dimensions.push(`W: ${formatAttributeKey(width)}`);
    if (length) dimensions.push(`L: ${formatAttributeKey(length)}`);

    return dimensions.length > 0 ? dimensions.join(' ') : null;
  }

  return null;
};

export function ProductTileFlyOut({ product, locale = 'de' }: ProductTileProps) {
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
                alt={l10n(image?.altText || '', locale) || ''}
              />
            )}
          </div>
        )}
        <div id="details text-md">
          <p>{l10n(product.brand?.name ?? '', locale)}</p>
          <MarkedText className="text-md" text={l10n(product.name, locale)} />
          <p className="text-sm font-bold">
            {product.price && formatCurrency(product.price.amount, product.price.currency)}
          </p>
          {(() => {
            // TODO make this more dynamic and also localize the keys
            // Calculate how many attributes to show in total (max 3)
            const maxTotalAttributes = 3;
            const variantAttributes = product.mixins?.productVariantAttributes as Record<string, string> | undefined;
            const templateAttributes = product.mixins?.productTemplateAttributes as Record<string, string> | undefined;

            // Extract dimensions from template attributes if they exist
            const dimensionsLine = templateAttributes ? extractDimensions(templateAttributes) : null;

            // Create a filtered template attributes object without height, width, length
            const filteredTemplateAttributes = templateAttributes
              ? Object.fromEntries(
                  Object.entries(templateAttributes).filter(([key]) => !['height', 'width', 'length'].includes(key)),
                )
              : undefined;

            // Count variant attributes (if any)
            const variantCount = variantAttributes ? Object.keys(variantAttributes).length : 0;
            // Calculate how many template attributes we can show (excluding dimensions which will be shown separately)
            const templateCount = Math.max(0, maxTotalAttributes - variantCount - (dimensionsLine ? 1 : 0));

            return (
              <>
                {variantAttributes && renderAttributes(variantAttributes, Math.min(maxTotalAttributes, variantCount))}
                {dimensionsLine && <p className="text-sm">{dimensionsLine}</p>}
                {filteredTemplateAttributes &&
                  Object.keys(filteredTemplateAttributes).length > 0 &&
                  templateCount > 0 &&
                  renderAttributes(filteredTemplateAttributes, templateCount)}
              </>
            );
          })()}
        </div>
      </div>
    </Link>
  );
}
