import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import server from '@/platform/server';
import type { ApprovalService } from '@/platform/services/approval/ApprovalService';
import type { CustomerService } from '@/platform/services/customer/CustomerService';
import type { LoggerService } from '@/platform/services/logger/LoggerService';
import type { QuoteScope, QuoteUpdateRequest } from '@/platform/services/model/quote';
import type { QuoteService } from '@/platform/services/quote/QuoteService';

export async function POST(request: NextRequest) {
  let quoteId: string | undefined;
  let status: string | undefined;
  let linkedApprovalId: string | undefined;

  try {
    const requestBody = await request.json();
    const searchParams = request.nextUrl.searchParams;
    const isPatchOperationsRequest = Array.isArray(requestBody);

    const body = isPatchOperationsRequest ? null : requestBody;
    const operations = isPatchOperationsRequest ? (requestBody as QuoteUpdateRequest[]) : undefined;
    const statusOperation = operations?.find((operation) => operation.path === '/status');
    const requestStatusValue =
      statusOperation && typeof statusOperation.value === 'object' && statusOperation.value !== null
        ? (statusOperation.value as { value?: string; comment?: string; quoteReasonId?: string })
        : undefined;

    quoteId = isPatchOperationsRequest ? (searchParams.get('quoteId') ?? undefined) : body.quoteId;
    status = isPatchOperationsRequest ? requestStatusValue?.value : body.status;
    const approvalId = isPatchOperationsRequest ? (searchParams.get('approvalId') ?? undefined) : body.approvalId;
    const comment = isPatchOperationsRequest ? requestStatusValue?.comment : body.comment;
    const locale = isPatchOperationsRequest ? (searchParams.get('locale') ?? undefined) : body.locale;
    const oldStatus = isPatchOperationsRequest ? (searchParams.get('oldStatus') ?? undefined) : body.oldStatus;
    linkedApprovalId = approvalId;

    if (!quoteId) {
      return NextResponse.json({ error: 'Quote ID is required' }, { status: 400 });
    }

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    const customerService = server.get<CustomerService>('CustomerService');
    const quoteService = server.get<QuoteService>('QuoteService');
    let quoteUpdateScope: QuoteScope = 'session';
    let approvalService: ApprovalService | undefined;

    if (approvalId) {
      approvalService = server.get<ApprovalService>('ApprovalService');
      const currentCustomer = await customerService.getCustomer();

      if (!currentCustomer?.id) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
      }

      const approval = await approvalService.getApproval(approvalId);
      if (!approval) {
        return NextResponse.json({ error: 'Approval not found' }, { status: 404 });
      }

      const canAcceptPendingQuoteApproval =
        approval.resourceType === 'QUOTE' &&
        approval.resource.id === quoteId &&
        approval.action === 'CHECKOUT' &&
        approval.status === 'PENDING' &&
        status === 'ACCEPTED' &&
        approval.approver.userId === currentCustomer.id;

      const isAuthorizedApprovedQuoteUpdate =
        approval.resourceType === 'QUOTE' &&
        approval.resource.id === quoteId &&
        approval.status === 'APPROVED' &&
        approval.approver.userId === currentCustomer.id;

      if (!canAcceptPendingQuoteApproval && !isAuthorizedApprovedQuoteUpdate) {
        return NextResponse.json({ error: 'Not authorized to update quote for this approval' }, { status: 403 });
      }

      quoteUpdateScope = 'session';
    }

    let quoteReasonId: string | undefined;
    if (status === 'DECLINED' || oldStatus === 'OPEN') {
      const reasonType = status === 'DECLINED' ? 'DECLINE' : 'CHANGE';
      quoteReasonId = await quoteService.createQuoteReason(quoteId, comment, locale, reasonType);
    }
    const statusValue: {
      value: string;
      comment: string;
      quoteReasonId?: string;
    } = {
      value: status,
      comment: comment || '',
    };

    if (quoteReasonId) {
      statusValue.quoteReasonId = quoteReasonId;
    }

    const updateList: QuoteUpdateRequest[] = operations ?? [
      {
        op: 'REPLACE',
        path: '/status',
        value: statusValue,
      },
    ];
    await quoteService.updateQuote(quoteId, updateList, quoteUpdateScope);

    if (approvalService && approvalId && status === 'ACCEPTED') {
      const approval = await approvalService.getApproval(approvalId);
      if (approval?.status === 'PENDING') {
        await approvalService.updateApprovalStatus(approvalId, 'APPROVED');
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    const logger = server.get<LoggerService>('LoggerService');
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        path: '/api/quote/update-status',
        method: 'POST',
        quoteId,
        approvalId: linkedApprovalId,
        status,
      },
      'Error updating quote status',
    );
    const message = error instanceof Error ? error.message : 'Failed to update quote status';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
