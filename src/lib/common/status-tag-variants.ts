import type { BadgeVariant } from '@/components/ui/badge';
import type { ApprovalStatus } from '@/platform/services/model/approval';
import type { Order } from '@/platform/services/model/order/order';
import { ORDER_STATUS } from '@/platform/services/model/order/order-status';
import type { QuoteStatus } from '@/platform/services/model/quote';
import type { ReturnStatus } from '@/platform/services/model/return';

/** Compile-time check: every {@link QuoteStatus} must appear below and in {@link getQuoteStatusVariant}. */
const QUOTE_STATUS_KEYS: Record<QuoteStatus, true> = {
  CREATING: true,
  OPEN: true,
  IN_PROGRESS: true,
  DECLINED: true,
  ACCEPTED: true,
  ORDER_CREATED: true,
  CLOSED: true,
  CHANGE: true,
  DECLINE: true,
  DECLINED_BY_MERCHANT: true,
  EXPIRED: true,
};

/** Compile-time check: every {@link ReturnStatus} must appear below and in {@link getReturnStatusVariant}. */
const RETURN_STATUS_KEYS: Record<ReturnStatus, true> = {
  APPROVED: true,
  PENDING: true,
  REJECTED: true,
  REVIEWED: true,
  CLOSED: true,
};

/** Compile-time check: every {@link ApprovalStatus} must appear below and in {@link getApprovalStatusVariant}. */
const APPROVAL_STATUS_KEYS: Record<ApprovalStatus, true> = {
  PENDING: true,
  APPROVED: true,
  CLOSED: true,
  EXPIRED: true,
  DECLINED: true,
};

export function isOrderStatusValue(value: string): value is Order['status'] {
  return Object.prototype.hasOwnProperty.call(ORDER_STATUS, value);
}

export function isQuoteStatusValue(value: string): value is QuoteStatus {
  return Object.prototype.hasOwnProperty.call(QUOTE_STATUS_KEYS, value);
}

export function isReturnStatusValue(value: string): value is ReturnStatus {
  return Object.prototype.hasOwnProperty.call(RETURN_STATUS_KEYS, value);
}

export function isApprovalStatusValue(value: string): value is ApprovalStatus {
  return Object.prototype.hasOwnProperty.call(APPROVAL_STATUS_KEYS, value);
}

/** Maps every {@link Order['status']}; default covers malformed strings (e.g. AI). */
export function getOrderStatusVariant(status: Order['status']): BadgeVariant {
  switch (status) {
    case 'IN_CHECKOUT':
      return 'outline';
    case 'CREATED':
      return 'information';
    case 'CONFIRMED':
    case 'SHIPPED':
      return 'success';
    case 'DELIVERED':
      return 'muted';
    case 'PROCESSING':
    case 'READY_FOR_PICKUP':
    case 'READY_FOR_SHIPPING':
      return 'warning';
    case 'COMPLETED':
      return 'muted';
    case 'CANCELLED':
    case 'DECLINED':
      return 'destructive';
    default:
      return 'outline';
  }
}

/** Maps every {@link QuoteStatus}; default covers malformed strings (e.g. AI). */
export function getQuoteStatusVariant(status: QuoteStatus): BadgeVariant {
  switch (status) {
    case 'CREATING':
      return 'information';
    case 'CLOSED':
      return 'muted';
    case 'EXPIRED':
      return 'outline';
    case 'OPEN':
      return 'information';
    case 'IN_PROGRESS':
      return 'warning';
    case 'DECLINED':
    case 'CHANGE':
    case 'DECLINE':
    case 'DECLINED_BY_MERCHANT':
      return 'destructive';
    case 'ACCEPTED':
    case 'ORDER_CREATED':
      return 'success';
    default:
      return 'outline';
  }
}

/** Maps every {@link ReturnStatus}. */
export function getReturnStatusVariant(status: ReturnStatus): BadgeVariant {
  switch (status) {
    case 'APPROVED':
      return 'success';
    case 'PENDING':
    case 'REVIEWED':
      return 'warning';
    case 'REJECTED':
      return 'destructive';
    case 'CLOSED':
      return 'muted';
    default:
      return 'default';
  }
}

/** Maps every {@link ApprovalStatus}; default covers unknown runtime values. */
export function getApprovalStatusVariant(status: ApprovalStatus): BadgeVariant {
  switch (status) {
    case 'APPROVED':
      return 'success';
    case 'PENDING':
      return 'warning';
    case 'DECLINED':
      return 'destructive';
    case 'EXPIRED':
      return 'muted';
    case 'CLOSED':
      return 'muted';
    default:
      return 'default';
  }
}
