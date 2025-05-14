import { Price, TaxType } from "../common";

export interface Product {
    id: string;
    name: string;
    description: string;
    price?: Price;
    images?: string[];
    taxType?: TaxType;
}