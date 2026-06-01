import { EmporixApprovalMapper } from './EmporixApprovalMapper';

describe('EmporixApprovalMapper', () => {
  it('maps approval resource itemId to productId when itemYrn is missing', () => {
    const mapper = new EmporixApprovalMapper({} as never, {} as never, {} as never);

    const approval = mapper.mapToService({
      id: 'approval-1',
      resourceType: 'QUOTE',
      action: 'CHECKOUT',
      status: 'PENDING',
      resource: {
        id: 'Q-1000',
        items: [
          {
            quantity: 2,
            itemId: 'product-1',
            itemPrice: {
              currency: 'USD',
              amount: 191.4,
            },
          },
        ],
      },
      requestor: {
        userId: 'requestor-1',
        firstName: 'Req',
        lastName: 'User',
        email: 'req@example.com',
      },
      approver: {
        userId: 'approver-1',
        firstName: 'App',
        lastName: 'User',
      },
      metadata: {
        version: 1,
        createdAt: '2026-06-01T00:00:00.000Z',
        updatedAt: '2026-06-01T00:00:00.000Z',
      },
    } as never);

    expect(approval.resource.items).toEqual([
      expect.objectContaining({
        itemId: 'product-1',
        productId: 'product-1',
      }),
    ]);
  });
});
