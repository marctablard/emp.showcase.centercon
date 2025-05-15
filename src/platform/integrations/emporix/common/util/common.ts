import { PaginatedResponse, SearchParams } from "../../model";

/**
 * Translate Search Parameters to Query and Body (for POST)
 * @param params 
 * @returns { body : q-Parameter for Search-Criteria, query : Query-Parameters } 
 */
export function buildSearchQuery<T>(params: SearchParams<T>): { body: string, query: string } {
    const queryParams = new URLSearchParams();

    if (params.page) {
        queryParams.append('pageNumber', params.page.toString());
    }
    if (params.size) {
        queryParams.append('pageSize', params.size.toString());
    }
    if (params.sort) {
        queryParams.append('sort', params.sort);
    }
    let query: string = '';
    if (params.criteria) {
        Object.entries(params.criteria).forEach(([key, value]) => {
            if (query.length > 0) {
                query += ' ';
            }
            query += (`${key}:${value}`);
        });
    }

    return { body: query, query: queryParams.toString() };
}


/**
 * Builds a PaginatedResponse object from a HTTP Response object
 * @param params search parameters
 * @param response HTTP response object
 * @returns PaginatedResponse object
 */
export async function buildPaginatedResponse<T>(params: SearchParams<T>, response: Response): Promise<PaginatedResponse<T>> {
    const total: number = Number(response.headers.get('x-total-count')) || -1;
    const data: T[] = await response.json();
    return {
        items: data,
        page: params.page || 0,
        size: params.size || 20,
        total: total
    };
}

export function checkTokenValidity(token?: string, expiryAt?: number, threshold: number = 300000): boolean {
  if (!token) {
    return false;
  }
  if (!expiryAt) {
    return true;
  }
  return Date.now() < expiryAt - threshold;
}