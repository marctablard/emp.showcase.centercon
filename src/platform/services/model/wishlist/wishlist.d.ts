import { LocalizedString, Price } from '../common';
import { ProductSpecification } from '../product';

export interface Wishlist {
  id: string;
  name: string;
  type: string;
  currency: string;
  siteCode: string;
  items: WishlistItem[];
  totalQuantity: number;
  totalKnownPrice?: {
    gross: Price;
    net: Price;
  };
}

export interface WishlistItem {
  id: string;
  quantity: number;
  productId: string;
  sku?: string;
  name?: LocalizedString | string;
  categoryName?: LocalizedString | string;
  imageUrl?: string;
  price?: {
    gross: Price;
    net: Price;
  };
  isPurchasable: boolean;
  hasCurrentPrice: boolean;
  unavailableReason?: string;
  specifications?: ProductSpecification[];
}
