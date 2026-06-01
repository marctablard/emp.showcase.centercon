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

function createRequest(body: unknown): { json: () => Promise<unknown> } {
  return {
    json: jest.fn().mockResolvedValue(body),
  };
}

describe('POST /api/quote/update-status', () => {
  let quoteService: {
    createQuoteReason: jest.Mock;
    updateQuote: jest.Mock;
  };
  let approvalService: {
    getApproval: jest.Mock;
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
          value: { value: 'ACCEPTED', comment: '', quoteReasonId: '' },
        },
      ],
      'session',
    );
  });

  it('uses service scope when a designated approver updates the linked quote through an approved approval', async () => {
    customerService.getCustomer.mockResolvedValueOnce({ id: 'approver-1' });
    approvalService.getApproval.mockResolvedValueOnce({
      id: 'approval-1',
      resourceType: 'QUOTE',
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
    expect(quoteService.updateQuote).toHaveBeenCalledWith(
      'Q-1000',
      [
        {
          op: 'REPLACE',
          path: '/status',
          value: { value: 'ACCEPTED', comment: '', quoteReasonId: '' },
        },
      ],
      'service',
    );
  });

  it('rejects approver-scoped quote updates when the current customer is not the designated approver', async () => {
    customerService.getCustomer.mockResolvedValueOnce({ id: 'other-user' });
    approvalService.getApproval.mockResolvedValueOnce({
      id: 'approval-1',
      resourceType: 'QUOTE',
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

    expect(response.status).toBe(403);
    expect(quoteService.updateQuote).not.toHaveBeenCalled();
  });
});
