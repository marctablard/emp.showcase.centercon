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

  try {
    const body = await request.json();
    quoteId = body.quoteId;
    status = body.status;
    const { approvalId, comment, locale, oldStatus } = body;

    if (!quoteId) {
      return NextResponse.json({ error: 'Quote ID is required' }, { status: 400 });
    }

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    const customerService = server.get<CustomerService>('CustomerService');
    const quoteService = server.get<QuoteService>('QuoteService');
    let quoteUpdateScope: QuoteScope = 'session';

    if (approvalId) {
      const approvalService = server.get<ApprovalService>('ApprovalService');
      const currentCustomer = await customerService.getCustomer();

      if (!currentCustomer?.id) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
      }

      const approval = await approvalService.getApproval(approvalId);
      if (!approval) {
        return NextResponse.json({ error: 'Approval not found' }, { status: 404 });
      }

      const isAuthorizedQuoteApprover =
        approval.resourceType === 'QUOTE' &&
        approval.resource.id === quoteId &&
        approval.status === 'APPROVED' &&
        approval.approver.userId === currentCustomer.id;

      if (!isAuthorizedQuoteApprover) {
        return NextResponse.json({ error: 'Not authorized to update quote for this approval' }, { status: 403 });
      }

      quoteUpdateScope = 'service';
    }

    let quoteReasonId = undefined;
    if (status === 'DECLINED' || oldStatus === 'OPEN') {
      const reasonType = status === 'DECLINED' ? 'DECLINE' : 'CHANGE';
      quoteReasonId = await quoteService.createQuoteReason(quoteId, comment, locale, reasonType);
    }
    const updateList: QuoteUpdateRequest[] = [];
    updateList.push({
      op: 'REPLACE',
      path: '/status',
      value: { value: status, comment: comment || '', quoteReasonId: quoteReasonId || '' },
    });
    await quoteService.updateQuote(quoteId, updateList, quoteUpdateScope);

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
        status,
      },
      'Error updating quote status',
    );
    const message = error instanceof Error ? error.message : 'Failed to update quote status';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
