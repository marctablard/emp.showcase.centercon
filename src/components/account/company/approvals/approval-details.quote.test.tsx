/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { Approval } from '@/platform/services/model/approval';
import { ApprovalDetails } from './approval-details';

const updateApprovalStatus = jest.fn();
const updateApproverComment = jest.fn();
const updateRequestorComment = jest.fn();
const productListResolverMock = jest.fn();
const pushMock = jest.fn();
const checkoutFromQuoteMock = jest.fn();
const mockUseSite = jest.fn();
const buildApproval = (overrides: Partial<Approval> = {}): Approval => ({
  id: 'approval-1',
  status: 'PENDING',
  resourceType: 'QUOTE',
  action: 'CHECKOUT',
  resource: { id: 'Q-1000' },
  requestor: { userId: 'requestor-1', firstName: 'Requester', lastName: 'One', email: 'requestor@example.com' },
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
  useRouter: () => ({
    push: pushMock,
  }),
}));

jest.mock('@/components/product/product-list-resolver', () => ({
  ProductListResolver: (props: unknown) => {
    productListResolverMock(props);
    return <div>ProductListResolver</div>;
  },
}));

jest.mock('@/lib/client/checkout', () => ({
  checkoutFromQuote: (request: unknown) => checkoutFromQuoteMock(request),
}));

jest.mock('@/hooks/site/useSite', () => ({
  useSite: () => mockUseSite(),
}));

jest.mock('@/hooks/approval/useApproval', () => ({
  useApproval: () => ({
    approval: mockApproval,
    loading: false,
    error: null,
    updateApprovalStatus,
    updateApproverComment,
    updateRequestorComment,
    deleteApproval: jest.fn(),
    refreshApproval: jest.fn(),
  }),
}));

describe('Company quote approval details', () => {
  beforeEach(() => {
    productListResolverMock.mockReset();
    pushMock.mockReset();
    mockApproval = buildApproval({
      details: {
        currency: 'USD',
        paymentMethods: [
          {
            id: 'payment-mode-1',
            provider: 'stripe',
            method: 'invoice',
          },
        ],
      },
      resource: {
        id: 'Q-1000',
        items: [
          {
            productId: 'product-1',
            itemYrn: 'urn:yaas:saasag:caasproduct:product;product-1',
            quantity: 2,
            itemPrice: {
              currency: 'USD',
              amount: 191.4,
              unitPrice: 95.7,
              calculatedPrice: {
                price: {
                  netValue: 191.4,
                },
              },
            },
          },
        ],
        totalPrice: {
          currency: 'USD',
          netValue: 200,
          grossValue: 238,
          taxValue: 38,
        },
        subtotalAggregate: {
          currency: 'USD',
          netValue: 191.4,
          grossValue: 227.77,
          taxValue: 36.37,
        },
        siteCode: 'main',
      },
    });
    updateApprovalStatus.mockReset();
    updateApprovalStatus.mockImplementation(async (status: Approval['status']) => {
      mockApproval = {
        ...mockApproval,
        status,
      };
    });
    updateApproverComment.mockReset();
    updateApproverComment.mockResolvedValue(undefined);
    updateRequestorComment.mockReset();
    updateRequestorComment.mockResolvedValue(undefined);
    checkoutFromQuoteMock.mockReset();
    checkoutFromQuoteMock.mockResolvedValue({ orderId: 'order-123' });
    mockUseSite.mockReset();
    mockUseSite.mockReturnValue({
      paymentModes: [
        {
          id: 'payment-mode-fallback',
          code: 'invoice',
          active: true,
        },
      ],
      loading: false,
    });
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ success: true }),
    });
  });

  it('approves the approval before accepting the linked quote', async () => {
    render(<ApprovalDetails approvalId="approval-1" currentUserId="approver-1" />);

    fireEvent.click(screen.getByText('approve'));

    await waitFor(() => {
      expect(updateApprovalStatus).toHaveBeenCalledWith('APPROVED');
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/quote/update-status',
        expect.objectContaining({
          method: 'POST',
        }),
      );
    });

    expect(updateApprovalStatus.mock.invocationCallOrder[0]).toBeLessThan(
      (global.fetch as jest.Mock).mock.invocationCallOrder[0],
    );
  });

  it('disables approval actions while the approve flow is in progress', async () => {
    let resolveApprovalStatus: (() => void) | undefined;
    updateApprovalStatus.mockReturnValueOnce(
      new Promise<void>((resolve) => {
        resolveApprovalStatus = resolve;
      }),
    );

    render(<ApprovalDetails approvalId="approval-1" currentUserId="approver-1" />);

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

  it('does not attempt quote acceptance when approval status update fails', async () => {
    updateApprovalStatus.mockRejectedValueOnce(new Error('approval update failed'));

    render(<ApprovalDetails approvalId="approval-1" currentUserId="approver-1" />);

    fireEvent.click(screen.getByText('approve'));

    await waitFor(() => {
      expect(updateApprovalStatus).toHaveBeenCalledTimes(1);
    });

    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('does not reopen the quote when approval succeeds but saving the approver comment fails', async () => {
    updateApproverComment.mockRejectedValueOnce(new Error('comment update failed'));

    render(<ApprovalDetails approvalId="approval-1" currentUserId="approver-1" />);

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

  it('shows a create-order form after a quote approval is approved', async () => {
    render(<ApprovalDetails approvalId="approval-1" currentUserId="approver-1" />);

    fireEvent.click(screen.getByText('approve'));

    await waitFor(() => {
      expect(screen.getByText('createOrderAfterApprovalTitle')).toBeInTheDocument();
      expect(screen.getByLabelText('yourComment')).toBeInTheDocument();
      expect(screen.getByText('createOrder')).toBeInTheDocument();
    });
  });

  it('creates an order from the approved quote and redirects to confirmation', async () => {
    mockApproval = buildApproval({
      status: 'APPROVED',
      details: {
        currency: 'USD',
        paymentMethods: [
          {
            id: 'payment-mode-1',
            provider: 'stripe',
            method: 'invoice',
          },
        ],
      },
      resource: {
        id: 'Q-1000',
        items: [],
        totalPrice: {
          currency: 'USD',
          netValue: 200,
          grossValue: 238,
          taxValue: 38,
        },
      },
    });

    render(<ApprovalDetails approvalId="approval-1" currentUserId="approver-1" />);

    fireEvent.change(screen.getByLabelText('yourComment'), {
      target: { value: 'Please ship fast' },
    });
    fireEvent.click(screen.getByText('createOrder'));

    await waitFor(() => {
      expect(checkoutFromQuoteMock).toHaveBeenCalledWith(
        expect.objectContaining({
          quoteId: 'Q-1000',
          currency: 'USD',
          paymentMethod: expect.objectContaining({
            id: 'payment-mode-1',
          }),
          customer: expect.objectContaining({
            userId: 'requestor-1',
            email: 'requestor@example.com',
          }),
        }),
      );
      expect(pushMock).toHaveBeenCalledWith('/confirmation/order-123');
    });
  });

  it('falls back to the first configured payment mode when approval details omit one', async () => {
    mockApproval = buildApproval({
      status: 'APPROVED',
      details: {
        currency: 'USD',
        paymentMethods: [],
      },
    });

    render(<ApprovalDetails approvalId="approval-1" currentUserId="approver-1" />);

    fireEvent.click(screen.getByText('createOrder'));

    await waitFor(() => {
      expect(checkoutFromQuoteMock).toHaveBeenCalledWith(
        expect.objectContaining({
          paymentMethod: expect.objectContaining({
            id: 'payment-mode-fallback',
            provider: 'none',
          }),
        }),
      );
    });
  });

  it('falls back to quote resource currency when approval details are missing', async () => {
    mockApproval = buildApproval({
      status: 'APPROVED',
      details: undefined,
      resource: {
        id: 'Q-1000',
        items: [],
        totalPrice: {
          currency: 'USD',
          netValue: 200,
          grossValue: 238,
          taxValue: 38,
        },
      },
    });

    render(<ApprovalDetails approvalId="approval-1" currentUserId="approver-1" />);

    fireEvent.click(screen.getByText('createOrder'));

    await waitFor(() => {
      expect(checkoutFromQuoteMock).toHaveBeenCalledWith(
        expect.objectContaining({
          currency: 'USD',
        }),
      );
    });
  });

  it('shows a clear error when quote checkout data is incomplete and no payment mode is configured', async () => {
    mockApproval = buildApproval({
      status: 'APPROVED',
      details: {
        currency: 'USD',
        paymentMethods: [],
      },
    });
    mockUseSite.mockReturnValueOnce({ paymentModes: [], loading: false });

    render(<ApprovalDetails approvalId="approval-1" currentUserId="approver-1" />);

    fireEvent.click(screen.getByText('createOrder'));

    await waitFor(() => {
      expect(screen.getByText('Missing payment method for quote checkout')).toBeInTheDocument();
    });

    expect(checkoutFromQuoteMock).not.toHaveBeenCalled();
  });

  it('disables create order while waiting for site payment modes when approval details omit one', () => {
    mockApproval = buildApproval({
      status: 'APPROVED',
      details: {
        currency: 'USD',
        paymentMethods: [],
      },
    });
    mockUseSite.mockReturnValueOnce({ paymentModes: undefined, loading: true });

    render(<ApprovalDetails approvalId="approval-1" currentUserId="approver-1" />);

    expect(screen.getByText('createOrder')).toBeDisabled();
  });

  it('declines a quote approval from the canonical company approval route', async () => {
    render(<ApprovalDetails approvalId="approval-1" currentUserId="approver-1" />);

    fireEvent.click(screen.getByText('decline'));

    await waitFor(() => {
      expect(updateApprovalStatus).toHaveBeenCalledWith('DECLINED');
    });
  });

  it('renders quote resource summary and line items from the approval payload', () => {
    render(<ApprovalDetails approvalId="approval-1" currentUserId="approver-1" />);

    expect(screen.getByText('ProductListResolver')).toBeInTheDocument();
    expect(screen.getByText('main')).toBeInTheDocument();
    expect(productListResolverMock).toHaveBeenCalledWith(
      expect.objectContaining({
        items: [
          {
            productId: 'product-1',
            itemYrn: 'urn:yaas:saasag:caasproduct:product;product-1',
            quantity: 2,
            unitPrice: 95.7,
            currency: 'USD',
          },
        ],
      }),
    );
  });

  it('renders generic approval metadata together with resource-driven quote details', () => {
    mockApproval = buildApproval({
      details: undefined,
      resource: {
        id: 'Q-1000',
        items: [
          {
            productId: 'product-1',
            itemYrn: 'urn:yaas:saasag:caasproduct:product;product-1',
            quantity: 2,
            itemPrice: {
              currency: 'USD',
              amount: 191.4,
              unitPrice: 95.7,
            },
          },
        ],
        totalPrice: {
          currency: 'USD',
          netValue: 200,
          grossValue: 238,
          taxValue: 38,
        },
      },
    });

    render(<ApprovalDetails approvalId="approval-1" currentUserId="approver-1" />);

    expect(screen.getByText('approval-1')).toBeInTheDocument();
    expect(screen.getByText('QUOTE')).toBeInTheDocument();
    expect(screen.getAllByText('Q-1000').length).toBeGreaterThan(0);
    expect(screen.getByText('ProductListResolver')).toBeInTheDocument();
  });

  it('preserves non-quote approval detail rendering without the quote navigation fallback', () => {
    mockApproval = buildApproval({
      resourceType: 'CART',
      resource: { id: 'cart-1' },
    });

    render(<ApprovalDetails approvalId="approval-1" />);

    expect(screen.getByText('CART')).toBeInTheDocument();
    expect(screen.getByText('cart-1')).toBeInTheDocument();
    expect(screen.queryByText('ProductListResolver')).not.toBeInTheDocument();
  });

  it('renders empty quote item state when approval resource has no items', () => {
    mockApproval = buildApproval({
      resource: {
        id: 'Q-1000',
        items: [],
        totalPrice: { currency: 'USD', grossValue: 0, netValue: 0, taxValue: 0 },
      },
    });

    render(<ApprovalDetails approvalId="approval-1" currentUserId="approver-1" />);

    expect(screen.queryByText('ProductListResolver')).not.toBeInTheDocument();
  });

  it('shows only the approver comment box to the approver', () => {
    render(<ApprovalDetails approvalId="approval-1" currentUserId="approver-1" />);

    expect(screen.getByText('addApproverComment')).toBeInTheDocument();
    expect(screen.queryByText('addRequestorComment')).not.toBeInTheDocument();
  });

  it('shows only the requestor comment box to the requestor', () => {
    render(<ApprovalDetails approvalId="approval-1" currentUserId="requestor-1" />);

    expect(screen.getByText('addRequestorComment')).toBeInTheDocument();
    expect(screen.queryByText('addApproverComment')).not.toBeInTheDocument();
    expect(screen.queryByText('approve')).not.toBeInTheDocument();
  });

  it('limits the approver comment textarea to 250 characters', () => {
    render(<ApprovalDetails approvalId="approval-1" currentUserId="approver-1" />);

    const commentField = screen.getByPlaceholderText('enterApproverComment') as HTMLTextAreaElement;

    fireEvent.change(commentField, { target: { value: 'a'.repeat(300) } });

    expect(commentField.value).toHaveLength(250);
  });

  it('limits the requestor comment textarea to 250 characters', () => {
    render(<ApprovalDetails approvalId="approval-1" currentUserId="requestor-1" />);

    const commentField = screen.getByPlaceholderText('enterRequestorComment') as HTMLTextAreaElement;

    fireEvent.change(commentField, { target: { value: 'a'.repeat(300) } });

    expect(commentField.value).toHaveLength(250);

    expect(updateRequestorComment).not.toHaveBeenCalled();
  });
});
