export interface EmporixAddress {
    contactName?: string;
    companyName?: string;
    street: string;
    streetNumber?: string;
    streetAppendix?: string;
    extraLine1?: string;
    extraLine2?: string;
    extraLine3?: string;
    extraLine4?: string;
    zipCode: string;
    city: string;
    country: string;
    state?: string;
    contactPhone?: string;
    type?: string;
    metadata?: Metadata;
    mixins?: Mixins;
}

export interface SearchParams<T> {
    query?: string;
    page?: number;
    size?: number;
    sort?: string;
    criteria?: Partial<T>;
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    size: number;
}

export interface Media {
    id: string;
    url: string;
    contentType: string;
    tags?: string[];
    customAttributes?: {
        name: string;
        id: string;
        type: string;
    };
    createdAt?: string;
}

export interface Metadata {
    mixins: {
        [key: string]: string;
    };
    [key: string]: string | number | object | Array | null;
}

export interface Mixin {
    [key: string]: string | number | object | Array | null;
}

export interface Mixins {
    [key: string]: Mixin;
}