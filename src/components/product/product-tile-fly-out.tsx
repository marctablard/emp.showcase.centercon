import Image from 'next/image';
import Link from 'next/link';
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

export function ProductTileFlyOut({ product: { id, name, brand, price, images }, locale = 'de' }: ProductTileProps) {
  const getLocalized = getLocalizedString(locale);
  const [image] = images || [];

  return (
    <Link href={`/product/${id}`}>
      <div className="flex">
        {images && (
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
          <p>{getLocalized(brand?.name ?? '')}</p>
          <MarkedText text={getLocalized(name)} />
          <p>Capacity: 440 W</p>
          <p>L 113,4 x B 172,2 x H 3 cm</p>
          <p>
            {price?.amount} {price?.currency}
          </p>
        </div>
      </div>
    </Link>
  );
}
