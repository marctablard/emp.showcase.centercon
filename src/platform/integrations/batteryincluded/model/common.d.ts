import { Media as EmporixMedia } from "@/platform/integrations/emporix/model/common";

export interface BatteryIncludedSearchParams<T> {
    query?: string;
    page?: number;
    size?: number;
    sort?: string;
    locale?: string;
    preset?: string;
    filters?: Record<string, string | string[]>;
}

export interface BatteryIncludedFacetCount {
    counts: [{
        count: number;
        value: string;
    }];
    field_name: string;
    stats: {
        total_values: number;
    };
    type: 'select' | 'range';
}

export interface BatteryIncludedSearchResponse<T> {
    hits: [
        {document: T}
    ];
    found: number;
    page: number;
    size: number;
    facet_counts: [BatteryIncludedFacetCount]
}

export interface BatteryIncludedMedia extends EmporixMedia {
    // same as EmporixMedia
}

export interface BatteryIncludedPreset {
    id: string;
    name: string;
    description?: string;
    query?: string;
    filters?: Record<string, any>;
    sort?: string;
}

export interface BatteryIncludedHighlight {
    id: string;
    name: string;
    description?: string;
    products: string[];
}

export interface BatteryIncludedSuggestion {
    text: string;
    count: number;
}
