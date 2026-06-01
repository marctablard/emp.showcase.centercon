/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { Approval } from '@/platform/services/model/approval';
import { ApprovalDetails } from './approval-details';

const updateApprovalStatus = jest.fn();
const updateApproverComment = jest.fn();
const buildApproval = (overrides: Partial<Approval> = {}): Approval => ({
  id: 'approval-1',
  status: 'PENDING',
  resourceType: 'QUOTE',
  action: 'CHECKOUT',
  resource: { id: 'Q-1000' },
  requestor: { userId: 'requestor-1' },
  approver: { userId: 'approver-1' },
  createdAt: '2026-05-29T10:00:00.000Z',
  comment: 'request comment',
  ...overrides,
});
let mockApproval: Approval = buildApproval();

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'en',
}));

jest.mock('@/i18n/navigation', () => ({
  Link: ({ href, children }: { href: string; children: React.ReactNode }) => <a href={href}>{children}</a>,
}));

jest.mock('@/hooks/approval/useApproval', () => ({
  useApproval: () => ({
    approval: mockApproval,
    loading: false,
    error: null,
    updateApprovalStatus,
    updateApproverComment,
    updateRequestorComment: jest.fn(),
    deleteApproval: jest.fn(),
    refreshApproval: jest.fn(),
  }),
}));

describe('Company quote approval details', () => {
  beforeEach(() => {
    mockApproval = buildApproval();
    updateApprovalStatus.mockReset();
    updateApprovalStatus.mockResolvedValue(undefined);
    updateApproverComment.mockReset();
    updateApproverComment.mockResolvedValue(undefined);
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ success: true }),
    });
  });

  it('accepts the linked quote before approving a quote approval', async () => {
    render(<ApprovalDetails approvalId="approval-1" />);

    fireEvent.click(screen.getByText('approve'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/quote/update-status',
        expect.objectContaining({
          method: 'POST',
        }),
      );
      expect(updateApprovalStatus).toHaveBeenCalledWith('APPROVED');
    });
  });

  it('disables approval actions while the approve flow is in progress', async () => {
    let resolveApprovalStatus: (() => void) | undefined;
    updateApprovalStatus.mockReturnValueOnce(
      new Promise<void>((resolve) => {
        resolveApprovalStatus = resolve;
      }),
    );

    render(<ApprovalDetails approvalId="approval-1" />);

    fireEvent.click(screen.getByText('approve'));

    await waitFor(() => {
      expect(screen.getByText('approve')).toBeDisabled();
      expect(screen.getByText('decline')).toBeDisabled();
    });

    resolveApprovalStatus?.();

    await waitFor(() => {
      expect(screen.getByText('approve')).not.toBeDisabled();
    });
  });

  it('reopens the quote if approval status update fails after quote acceptance', async () => {
    updateApprovalStatus.mockRejectedValueOnce(new Error('approval update failed'));
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({ success: true }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({ success: true }),
      });

    render(<ApprovalDetails approvalId="approval-1" />);

    fireEvent.click(screen.getByText('approve'));

    await waitFor(() => {
      expect(updateApprovalStatus).toHaveBeenCalledTimes(1);
    });

    expect(global.fetch).toHaveBeenNthCalledWith(
      1,
      '/api/quote/update-status',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          quoteId: 'Q-1000',
          status: 'ACCEPTED',
          comment: undefined,
          locale: 'en',
        }),
      }),
    );
    expect(global.fetch).toHaveBeenNthCalledWith(
      2,
      '/api/quote/update-status',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          quoteId: 'Q-1000',
          status: 'OPEN',
          comment: undefined,
          locale: 'en',
        }),
      }),
    );
  });

  it('does not reopen the quote when approval succeeds but saving the approver comment fails', async () => {
    updateApproverComment.mockRejectedValueOnce(new Error('comment update failed'));

    render(<ApprovalDetails approvalId="approval-1" />);

    fireEvent.change(screen.getByPlaceholderText('enterApproverComment'), {
      target: { value: 'Needs approval note' },
    });
    fireEvent.click(screen.getByText('approve'));

    await waitFor(() => {
      expect(updateApprovalStatus).toHaveBeenCalledWith('APPROVED');
      expect(updateApproverComment).toHaveBeenCalledWith('Needs approval note');
    });

    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('declines a quote approval from the canonical company approval route', async () => {
    render(<ApprovalDetails approvalId="approval-1" />);

    fireEvent.click(screen.getByText('decline'));

    await waitFor(() => {
      expect(updateApprovalStatus).toHaveBeenCalledWith('DECLINED');
    });
  });

  it('renders a link to the linked quote for quote approvals', () => {
    render(<ApprovalDetails approvalId="approval-1" />);

    expect(screen.getByRole('link', { name: 'viewFullQuoteDetails' })).toHaveAttribute(
      'href',
      '/account/quotes/Q-1000',
    );
  });

  it('renders generic approval metadata and quote navigation when quote approval details are missing', () => {
    mockApproval = buildApproval({ details: undefined });

    render(<ApprovalDetails approvalId="approval-1" />);

    expect(screen.getByText('approval-1')).toBeInTheDocument();
    expect(screen.getByText('QUOTE')).toBeInTheDocument();
    expect(screen.getByText('Q-1000')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'viewFullQuoteDetails' })).toHaveAttribute(
      'href',
      '/account/quotes/Q-1000',
    );
  });

  it('preserves non-quote approval detail rendering without the quote navigation fallback', () => {
    mockApproval = buildApproval({
      resourceType: 'CART',
      resource: { id: 'cart-1' },
    });

    render(<ApprovalDetails approvalId="approval-1" />);

    expect(screen.getByText('CART')).toBeInTheDocument();
    expect(screen.getByText('cart-1')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'viewFullQuoteDetails' })).not.toBeInTheDocument();
  });
});
