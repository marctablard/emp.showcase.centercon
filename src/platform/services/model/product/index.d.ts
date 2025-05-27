import { Price, TaxType, Media } from "../common";
import { LocalizedString } from "../common";
;
export interface Product {
    id: string;
    name: string | LocalizedString;
    description: string | LocalizedString;
    price?: Price;
    primaryImage?: Media;
    images?: Media[];
    taxType?: TaxType;
}