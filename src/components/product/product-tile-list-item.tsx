import { Product } from '@platform/services/model/product';

interface ProductTileProps {
  product: Product;
  locale?: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function ProductTileListItem({ product, locale = 'de' }: ProductTileProps) {
  // Todo: this has to be implemented
  return <p>List view currently not available. Please select grid view.</p>;
}
