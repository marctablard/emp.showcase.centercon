export interface CartEntry {
  currency: string;
  cartId: string;
  legalEntityId?: string;
  channel?: string;
}
export interface CartCookie {
  [siteCode: string]: CartEntry[];
}
