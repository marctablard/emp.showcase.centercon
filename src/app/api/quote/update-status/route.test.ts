import { POST } from './route';

jest.mock('@/platform/server', () => {
  const services = new Map<string, unknown>();
  return {
    __esModule: true,
    default: {
      get: jest.fn((id: string) => services.get(id)),
      __services: services,
    },
  };
});

const mockedServer = jest.requireMock('@/platform/server') as {
  default: { get: jest.Mock; __services: Map<string, unknown> };
};

function createRequest(
  body: unknown,
  url = 'https://example.test/api/quote/update-status',
): {
  json: () => Promise<unknown>;
  nextUrl: URL;
} {
  return {
    json: jest.fn().mockResolvedValue(body),
    nextUrl: new URL(url),
  };
}

describe('POST /api/quote/update-status', () => {
  let quoteService: {
    createQuoteReason: jest.Mock;
    updateQuote: jest.Mock;
  };
  let approvalService: {
    getApproval: jest.Mock;
    updateApprovalStatus: jest.Mock;
  };
  let customerService: {
    getCustomer: jest.Mock;
  };
  let logger: {
    error: jest.Mock;
  };

  beforeEach(() => {
    quoteService = {
      createQuoteReason: jest.fn(),
      updateQuote: jest.fn().mockResolvedValue(undefined),
    };
    approvalService = {
      getApproval: jest.fn(),
      updateApprovalStatus: jest.fn().mockResolvedValue(undefined),
    };
    customerService = {
      getCustomer: jest.fn(),
    };
    logger = {
      error: jest.fn(),
    };

    mockedServer.default.__services.clear();
    mockedServer.default.__services.set('QuoteService', quoteService);
    mockedServer.default.__services.set('ApprovalService', approvalService);
    mockedServer.default.__services.set('CustomerService', customerService);
    mockedServer.default.__services.set('LoggerService', logger);
    mockedServer.default.get.mockImplementation((id: string) => mockedServer.default.__services.get(id));
  });

  it('uses session scope for standard customer-owned quote status updates', async () => {
    const response = await POST(
      createRequest({
        quoteId: 'Q-1000',
        status: 'ACCEPTED',
        locale: 'en',
      }) as never,
    );

    expect(response.status).toBe(200);
    expect(quoteService.updateQuote).toHaveBeenCalledWith(
      'Q-1000',
      [
        {
          op: 'REPLACE',
          path: '/status',
          value: { value: 'ACCEPTED', comment: '' },
        },
      ],
      'session',
    );
  });

  it('uses session scope when a designated approver accepts a linked quote through a pending approval', async () => {
    customerService.getCustomer.mockResolvedValueOnce({ id: 'approver-1' });
    approvalService.getApproval.mockResolvedValueOnce({
      id: 'approval-1',
      resourceType: 'QUOTE',
      action: 'CHECKOUT',
      status: 'PENDING',
      resource: { id: 'Q-1000' },
      approver: { userId: 'approver-1' },
    });
    approvalService.getApproval.mockResolvedValueOnce({
      id: 'approval-1',
      resourceType: 'QUOTE',
      action: 'CHECKOUT',
      status: 'PENDING',
      resource: { id: 'Q-1000' },
      approver: { userId: 'approver-1' },
    });

    const response = await POST(
      createRequest({
        quoteId: 'Q-1000',
        status: 'ACCEPTED',
        approvalId: 'approval-1',
        locale: 'en',
      }) as never,
    );

    expect(response.status).toBe(200);
    expect(quoteService.updateQuote).toHaveBeenCalledWith(
      'Q-1000',
      [
        {
          op: 'REPLACE',
          path: '/status',
          value: { value: 'ACCEPTED', comment: '' },
        },
      ],
      'session',
    );
    expect(approvalService.updateApprovalStatus).toHaveBeenCalledWith('approval-1', 'APPROVED');
  });

  it('includes quoteReasonId only when a quote reason is created', async () => {
    quoteService.createQuoteReason.mockResolvedValueOnce('reason-1');

    const response = await POST(
      createRequest({
        quoteId: 'Q-1000',
        status: 'DECLINED',
        comment: 'Need changes',
        locale: 'en',
      }) as never,
    );

    expect(response.status).toBe(200);
    expect(quoteService.updateQuote).toHaveBeenCalledWith(
      'Q-1000',
      [
        {
          op: 'REPLACE',
          path: '/status',
          value: { value: 'DECLINED', comment: 'Need changes', quoteReasonId: 'reason-1' },
        },
      ],
      'session',
    );
  });

  it('rejects approver-scoped quote updates when the current customer is not the designated approver', async () => {
    customerService.getCustomer.mockResolvedValueOnce({ id: 'other-user' });
    approvalService.getApproval.mockResolvedValueOnce({
      id: 'approval-1',
      resourceType: 'QUOTE',
      action: 'CHECKOUT',
      status: 'PENDING',
      resource: { id: 'Q-1000' },
      approver: { userId: 'approver-1' },
    });

    const response = await POST(
      createRequest({
        quoteId: 'Q-1000',
        status: 'ACCEPTED',
        approvalId: 'approval-1',
        locale: 'en',
      }) as never,
    );

    expect(response.status).toBe(403);
    expect(quoteService.updateQuote).not.toHaveBeenCalled();
  });

  it('does not re-approve an approval that is already approved after quote update', async () => {
    customerService.getCustomer.mockResolvedValueOnce({ id: 'approver-1' });
    approvalService.getApproval.mockResolvedValueOnce({
      id: 'approval-1',
      resourceType: 'QUOTE',
      action: 'CHECKOUT',
      status: 'PENDING',
      resource: { id: 'Q-1000' },
      approver: { userId: 'approver-1' },
    });
    approvalService.getApproval.mockResolvedValueOnce({
      id: 'approval-1',
      resourceType: 'QUOTE',
      action: 'CHECKOUT',
      status: 'APPROVED',
      resource: { id: 'Q-1000' },
      approver: { userId: 'approver-1' },
    });

    const response = await POST(
      createRequest({
        quoteId: 'Q-1000',
        status: 'ACCEPTED',
        approvalId: 'approval-1',
        locale: 'en',
      }) as never,
    );

    expect(response.status).toBe(200);
    expect(approvalService.updateApprovalStatus).not.toHaveBeenCalled();
  });

  it('accepts the patch-operations request form used by the approver flow', async () => {
    customerService.getCustomer.mockResolvedValueOnce({ id: 'approver-1' });
    approvalService.getApproval.mockResolvedValueOnce({
      id: 'approval-1',
      resourceType: 'QUOTE',
      action: 'CHECKOUT',
      status: 'PENDING',
      resource: { id: 'Q-1000' },
      approver: { userId: 'approver-1' },
    });
    approvalService.getApproval.mockResolvedValueOnce({
      id: 'approval-1',
      resourceType: 'QUOTE',
      action: 'CHECKOUT',
      status: 'PENDING',
      resource: { id: 'Q-1000' },
      approver: { userId: 'approver-1' },
    });

    const response = await POST(
      createRequest(
        [
          {
            op: 'REPLACE',
            path: '/status',
            value: { value: 'ACCEPTED', comment: 'approved quote' },
          },
        ],
        'https://example.test/api/quote/update-status?quoteId=Q-1000&approvalId=approval-1&locale=en',
      ) as never,
    );

    expect(response.status).toBe(200);
    expect(quoteService.updateQuote).toHaveBeenCalledWith(
      'Q-1000',
      [
        {
          op: 'REPLACE',
          path: '/status',
          value: { value: 'ACCEPTED', comment: 'approved quote' },
        },
      ],
      'session',
    );
    expect(approvalService.updateApprovalStatus).toHaveBeenCalledWith('approval-1', 'APPROVED');
  });
});
