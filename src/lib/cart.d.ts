export interface CartCookieEntry {
  currency: string;
  cartId: string;
  legalEntityId?: string;
  channel?: string;
}

export interface CartCookieItem {
  pId: string;
  qty: number;
}

export interface CartCookie {
  [siteCode: string]: CartCookieEntry[];
}
