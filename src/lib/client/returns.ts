import type { Return } from '@/platform/services/model/return';

/**
 * Item to return - contains item ID and quantity
 */
export interface CreateReturnItem {
  id: string;
  quantity: number;
}

/**
 * Response from create return API
 */
export interface CreateReturnResponse {
  id: string;
}

/**
 * Create a new return for an order
 * @param orderId The ID of the order to create return for
 * @param items Array of items to return with quantities
 * @returns Promise with the created return ID
 */
export async function createReturn(orderId: string, items: CreateReturnItem[]): Promise<CreateReturnResponse> {
  const response = await fetch('/api/returns', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ orderId, items }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to create return');
  }

  return response.json();
}

/**
 * Fetch all returns for the current customer
 * @param pageSize Optional page size (default: 60)
 * @param pageNumber Optional page number (default: 1)
 * @returns Promise with array of returns
 */
export async function fetchReturns(pageSize?: number, pageNumber?: number): Promise<Return[]> {
  const params = new URLSearchParams();
  if (pageSize) params.set('pageSize', pageSize.toString());
  if (pageNumber) params.set('pageNumber', pageNumber.toString());

  const queryString = params.toString();
  const url = `/api/returns${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch returns');
  }

  return response.json();
}

/**
 * Fetch a specific return by ID
 * @param returnId The ID of the return to fetch
 * @returns Promise with the return
 */
export async function fetchReturnById(returnId: string): Promise<Return> {
  const response = await fetch(`/api/returns/${returnId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Return not found');
    }
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch return');
  }

  return response.json();
}
