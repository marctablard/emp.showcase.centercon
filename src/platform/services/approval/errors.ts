export class ApprovalAlreadyExistsError extends Error {
  readonly approvalId: string;

  constructor(approvalId: string) {
    super('Approval already exists');
    this.name = 'ApprovalAlreadyExistsError';
    this.approvalId = approvalId;
  }
}

export class ApprovalApproverNotPermittedError extends Error {
  readonly approverId: string;

  constructor(approverId: string) {
    super('Selected approver is not permitted for this approval');
    this.name = 'ApprovalApproverNotPermittedError';
    this.approverId = approverId;
  }
}
