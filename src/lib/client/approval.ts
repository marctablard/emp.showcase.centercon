import type { ApprovalCreateRequest, ApprovalId, ApprovalUser } from '@/platform/services/model/approval';

/**
 * Check if a cart requires approval
 * @param cartId The ID of the cart to check
 * @returns Promise with boolean indicating if approval is required
 */
export async function requiresApproval(cartId: string): Promise<boolean> {
  const response = await fetch(`/api/approval/requires-approval?cartId=${cartId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.details || 'Failed to check approval requirements');
  }

  const result = await response.json();
  return result === true;
}

/**
 * Search for users who can approve a specific resource
 * @param resourceType The type of resource (e.g., 'cart', 'order')
 * @param resourceId The ID of the resource
 * @param action The action being performed (e.g., 'checkout')
 * @returns Promise with array of approval users
 */
export async function searchApprovalUsers(
  resourceType: string,
  resourceId: string,
  action: string,
): Promise<ApprovalUser[]> {
  const response = await fetch(
    `/api/approval/users?resourceType=${resourceType}&resourceId=${resourceId}&action=${action}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.details || 'Failed to search approval users');
  }

  return response.json();
}

/**
 * Create a new approval request
 * @param approval The approval request data
 * @returns Promise with the created approval ID
 */
export async function createApproval(approval: ApprovalCreateRequest): Promise<ApprovalId> {
  const response = await fetch('/api/approval', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(approval),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.details || 'Failed to create approval request');
  }

  return response.json();
}
