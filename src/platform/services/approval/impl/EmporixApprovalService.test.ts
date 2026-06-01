import type { EmporixApprovalApi } from '@/platform/integrations/emporix/approval/EmporixApprovalApi';
import type { EmporixIamApi } from '@/platform/integrations/emporix/iam/EmporixIamApi';
import { ApprovalAlreadyExistsError, ApprovalApproverNotPermittedError } from '@/platform/services/approval/errors';
import type { CustomerService } from '@/platform/services/customer/CustomerService';
import type { ApprovalCreateRequest } from '@/platform/services/model/approval';
import type { EmporixApprovalMapper } from '@/platform/services/model/approval/impl/EmporixApprovalMapper';
import EmporixApprovalService from './EmporixApprovalService';

describe('EmporixApprovalService', () => {
  let approvalService: EmporixApprovalService;
  let mockApprovalApi: jest.Mocked<
    Pick<EmporixApprovalApi, 'checkApprovalPermitted' | 'searchApprovalUsers' | 'createApproval'>
  >;
  let mockApprovalMapper: jest.Mocked<Pick<EmporixApprovalMapper, 'mapCreateRequestToSource'>>;

  const approvalRequest: ApprovalCreateRequest = {
    resourceId: 'quote-1',
    resourceType: 'QUOTE',
    action: 'CHECKOUT',
    approver: { userId: 'approver-1' },
    comment: 'Please review',
  };

  beforeEach(() => {
    mockApprovalApi = {
      checkApprovalPermitted: jest.fn().mockResolvedValue({ permitted: false }),
      searchApprovalUsers: jest.fn().mockResolvedValue([
        {
          userId: 'approver-1',
          firstName: 'Taylor',
          lastName: 'Approver',
        },
      ]),
      createApproval: jest.fn().mockResolvedValue({ id: 'approval-1' }),
    };

    mockApprovalMapper = {
      mapCreateRequestToSource: jest.fn().mockReturnValue({
        resourceId: 'quote-1',
        resourceType: 'QUOTE',
        action: 'CHECKOUT',
        approver: { userId: 'approver-1' },
        comment: 'Please review',
      }),
    };

    approvalService = new EmporixApprovalService(
      {} as EmporixIamApi,
      mockApprovalApi as unknown as EmporixApprovalApi,
      mockApprovalMapper as unknown as EmporixApprovalMapper,
      {} as CustomerService,
    );
  });

  it('rejects approval creation when the selected approver is not permitted for the resource', async () => {
    mockApprovalApi.searchApprovalUsers.mockResolvedValueOnce([
      {
        userId: 'approver-9',
        firstName: 'Other',
        lastName: 'Approver',
      },
    ]);

    const createApprovalPromise = approvalService.createApproval(approvalRequest);

    await expect(createApprovalPromise).rejects.toBeInstanceOf(ApprovalApproverNotPermittedError);
    await expect(createApprovalPromise).rejects.toMatchObject({ approverId: 'approver-1' });

    expect(mockApprovalApi.searchApprovalUsers).toHaveBeenCalledWith({
      resourceId: 'quote-1',
      resourceType: 'QUOTE',
      action: 'CHECKOUT',
    });
    expect(mockApprovalMapper.mapCreateRequestToSource).not.toHaveBeenCalled();
    expect(mockApprovalApi.createApproval).not.toHaveBeenCalled();
  });

  it('keeps duplicate prevention ahead of approver validation', async () => {
    mockApprovalApi.checkApprovalPermitted.mockResolvedValueOnce({
      permitted: false,
      approvalId: 'approval-existing-1',
    });

    const createApprovalPromise = approvalService.createApproval(approvalRequest);

    await expect(createApprovalPromise).rejects.toBeInstanceOf(ApprovalAlreadyExistsError);
    await expect(createApprovalPromise).rejects.toMatchObject({ approvalId: 'approval-existing-1' });

    expect(mockApprovalApi.searchApprovalUsers).not.toHaveBeenCalled();
    expect(mockApprovalMapper.mapCreateRequestToSource).not.toHaveBeenCalled();
    expect(mockApprovalApi.createApproval).not.toHaveBeenCalled();
  });

  it('maps create failures to duplicate approvals when a re-check finds the new approval', async () => {
    mockApprovalApi.createApproval.mockRejectedValueOnce(new Error('Failed to create approval'));
    mockApprovalApi.checkApprovalPermitted
      .mockResolvedValueOnce({ permitted: false })
      .mockResolvedValueOnce({ permitted: false, approvalId: 'approval-existing-2' });

    const createApprovalPromise = approvalService.createApproval(approvalRequest);

    await expect(createApprovalPromise).rejects.toBeInstanceOf(ApprovalAlreadyExistsError);
    await expect(createApprovalPromise).rejects.toMatchObject({ approvalId: 'approval-existing-2' });
  });

  it('preserves the original create error when the duplicate re-check also fails', async () => {
    const createError = new Error('Failed to create approval');

    mockApprovalApi.createApproval.mockRejectedValueOnce(createError);
    mockApprovalApi.checkApprovalPermitted
      .mockResolvedValueOnce({ permitted: false })
      .mockRejectedValueOnce(new Error('Failed to re-check approval state'));

    await expect(approvalService.createApproval(approvalRequest)).rejects.toBe(createError);
  });
});
