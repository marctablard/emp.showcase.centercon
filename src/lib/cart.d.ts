export interface CartCookieEntry {
  currency: string;
  cartId: string;
  legalEntityId?: string;
  channel?: string;
  items: CartCookieItem[];
}

export interface CartCookieItem {
  pId: string;
  qty: number;
}

export interface CartCookie {
  [siteCode: string]: CartCookieEntry[];
}
