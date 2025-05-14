import { Media, Metadata, Mixins } from "./common";

export interface Product {
    id?: string;
    yrn?: string;
    code: string;
    name: string;
    description?: string;
    media?: Media[];
    productType?: string;
    brandId?: string;
    taxClasses?: {
        [key: string]: string;
    };
    mixins?: Mixins;
    published?: boolean;
    metadata?: Metadata;
}