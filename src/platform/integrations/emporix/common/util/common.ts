import type { EmporixPaginatedResponse, EmporixSearchParams } from '../../model';

const RAW_SEARCH_CRITERIA_KEY = 'compoundLogicalQuery';

/**
 * Translate Search Parameters to Query and Body (for POST)
 * @param params
 * @returns { body : q-Parameter for Search-Criteria, query : Query-Parameters }
 */
export function buildSearchQuery<T>(
  params: EmporixSearchParams<T>,
  filterAsQuery: boolean = false,
): { body: string; query: string } {
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
  if (params.expand) {
    queryParams.append('expand', params.expand.join(','));
  }
  let query: string = '';
  if (params.criteria) {
    Object.entries(params.criteria).forEach(([key, value]) => {
      if (value === undefined || value === null) {
        return;
      }
      if (filterAsQuery) {
        queryParams.append(key, '' + value);
      } else {
        if (query.length > 0) {
          query += ' ';
        }
        const strValue = String(value);
        if (key === RAW_SEARCH_CRITERIA_KEY) {
          query += strValue;
          return;
        }

        const safeValue = strValue.includes(' ') && !strValue.startsWith('(') ? `(${strValue})` : strValue;
        query += `${key}:${safeValue}`;
      }
    });
  }

  return { body: query, query: filterAsQuery ? queryParams.toString() : queryParams.toString() };
}

/**
 * Builds a PaginatedResponse object from a HTTP Response object
 * @param params search parameters
 * @param response HTTP response object
 * @returns PaginatedResponse object
 */
export async function buildPaginatedResponse<T>(
  params: EmporixSearchParams<any>,
  response: Response,
): Promise<EmporixPaginatedResponse<T>> {
  const total: number = Number(response.headers.get('x-total-count')) || -1;
  const raw = (await response.json()) as T[] | { items?: T[]; page?: number; size?: number; total?: number };
  const data = Array.isArray(raw) ? raw : (raw.items ?? []);
  return {
    items: data,
    page: Array.isArray(raw) ? params.page || 0 : (raw.page ?? (params.page || 0)),
    size: Array.isArray(raw) ? params.size || 20 : (raw.size ?? (params.size || 20)),
    total: Array.isArray(raw) ? total : (raw.total ?? total),
  };
}

export function checkTokenValidity(token?: string, expiryAt?: number, threshold: number = 6000): boolean {
  if (!token) {
    return false;
  }
  if (!expiryAt) {
    return true;
  }
  return Date.now() <= expiryAt - threshold;
}
