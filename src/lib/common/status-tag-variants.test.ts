import type { ApprovalStatus } from '@/platform/services/model/approval';
import { ORDER_STATUS } from '@/platform/services/model/order/order-status';
import {
  getApprovalStatusVariant,
  getOrderStatusVariant,
  getQuoteStatusVariant,
  getReturnStatusVariant,
  isApprovalStatusValue,
  isOrderStatusValue,
  isQuoteStatusValue,
  isReturnStatusValue,
} from './status-tag-variants';

describe('status-tag-variants', () => {
  describe('getOrderStatusVariant', () => {
    it('maps every ORDER_STATUS value', () => {
      for (const status of Object.values(ORDER_STATUS)) {
        expect(getOrderStatusVariant(status)).toEqual(expect.any(String));
      }
    });

    it('maps CONFIRMED to secondary', () => {
      expect(getOrderStatusVariant('CONFIRMED')).toBe('secondary');
    });

    it('maps CREATED to information', () => {
      expect(getOrderStatusVariant('CREATED')).toBe('information');
    });
  });

  describe('getQuoteStatusVariant', () => {
    const quoteStatuses = [
      'CREATING',
      'OPEN',
      'IN_PROGRESS',
      'DECLINED',
      'ACCEPTED',
      'ORDER_CREATED',
      'CLOSED',
    ] as const;

    it('maps every QuoteStatus value', () => {
      for (const status of quoteStatuses) {
        expect(isQuoteStatusValue(status)).toBe(true);
        expect(getQuoteStatusVariant(status)).toEqual(expect.any(String));
      }
    });

    it('maps OPEN to information', () => {
      expect(getQuoteStatusVariant('OPEN')).toBe('information');
    });
  });

  describe('getReturnStatusVariant', () => {
    const returnStatuses = ['APPROVED', 'PENDING', 'REJECTED', 'REVIEWED', 'CLOSED'] as const;

    it('maps every ReturnStatus value', () => {
      for (const status of returnStatuses) {
        expect(isReturnStatusValue(status)).toBe(true);
        expect(getReturnStatusVariant(status)).toEqual(expect.any(String));
      }
    });

    it('maps APPROVED to success', () => {
      expect(getReturnStatusVariant('APPROVED')).toBe('success');
    });

    it('maps REVIEWED to default (legacy ReturnStatusBadge)', () => {
      expect(getReturnStatusVariant('REVIEWED')).toBe('default');
    });
  });

  describe('getApprovalStatusVariant', () => {
    const approvalStatuses: ApprovalStatus[] = ['PENDING', 'APPROVED', 'CLOSED', 'EXPIRED', 'DECLINED'];

    it('maps every ApprovalStatus value', () => {
      for (const status of approvalStatuses) {
        expect(isApprovalStatusValue(status)).toBe(true);
        expect(getApprovalStatusVariant(status)).toEqual(expect.any(String));
      }
    });

    it('maps PENDING to warning', () => {
      expect(getApprovalStatusVariant('PENDING')).toBe('warning');
    });

    it('falls back to default variant for unknown runtime values', () => {
      expect(getApprovalStatusVariant('UNKNOWN' as ApprovalStatus)).toBe('default');
    });
  });

  describe('isOrderStatusValue', () => {
    it('accepts all order statuses', () => {
      for (const status of Object.values(ORDER_STATUS)) {
        expect(isOrderStatusValue(status)).toBe(true);
      }
    });

    it('rejects garbage', () => {
      expect(isOrderStatusValue('FAKE')).toBe(false);
    });
  });
});
