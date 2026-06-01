'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { AlertCircle, CheckCircle2, List, ReceiptText } from 'lucide-react';
import { ApprovalStatusBadge } from '@/components/account/approvals/approval-status-badge';
import { ProductListResolver } from '@/components/product/product-list-resolver';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import { SummaryCard, SummaryRow } from '@/components/ui/summary-card';
import { Textarea } from '@/components/ui/textarea';
import { useApproval } from '@/hooks/approval/useApproval';
import { useSite } from '@/hooks/site/useSite';
import { useRouter } from '@/i18n/navigation';
import { checkoutFromQuote } from '@/lib/client/checkout';
import { formatCurrency } from '@/lib/utils';
import type { Approval } from '@/platform/services/model/approval';
import type { CheckoutPaymentMethod, QuoteCheckoutRequest } from '@/platform/services/model/checkout';

interface ApprovalDetailsProps {
  approvalId: string;
  initialApproval?: Approval;
  currentUserId?: string;
}

interface ApprovalResourcePrice {
  currency: string;
  amount?: number;
  netValue?: number;
  grossValue?: number;
  taxValue?: number;
  unitPrice?: number;
  newUnitPrice?: number;
  calculatedPrice?: {
    price?: {
      netValue?: number;
      grossValue?: number;
      taxValue?: number;
    };
  };
}

interface ApprovalResourceItem {
  itemYrn?: string;
  productId?: string;
  quantity: number;
  itemPrice: ApprovalResourcePrice;
}

type ApprovalQuoteResource = Approval['resource'] & {
  items?: ApprovalResourceItem[];
  totalPrice?: ApprovalResourcePrice;
  subTotalPrice?: ApprovalResourcePrice;
  subtotalAggregate?: ApprovalResourcePrice;
};

export function ApprovalDetails({ approvalId, initialApproval, currentUserId }: ApprovalDetailsProps) {
  const t = useTranslations('orders.Approval');
  const tStatus = useTranslations('orders.ApprovalStatus');
  const tQuote = useTranslations('account.quoteDetails');
  const locale = useLocale();
  const router = useRouter();
  const maxCommentLength = 250;
  const [approverComment, setApproverComment] = useState<string>('');
  const [requestorComment, setRequestorComment] = useState<string>('');
  const [orderComment, setOrderComment] = useState<string>('');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isApprovalActionPending, setIsApprovalActionPending] = useState(false);
  const [isOrderCreationPending, setIsOrderCreationPending] = useState(false);
  const { paymentModes, loading: isSiteLoading } = useSite();

  const {
    approval,
    loading,
    error,
    updateApprovalStatus,
    updateApproverComment,
    updateRequestorComment,
    deleteApproval,
    refreshApproval,
  } = useApproval(approvalId, initialApproval);

  const updateQuoteStatus = async (
    quoteId: string,
    status: string,
    comment?: string,
    linkedApprovalId?: string,
  ): Promise<void> => {
    const response = await fetch('/api/quote/update-status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        quoteId,
        status,
        comment,
        approvalId: linkedApprovalId,
        locale,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.error || `Failed to update quote status to ${status}`);
    }
  };

  const acceptQuote = async (quoteId: string, comment?: string): Promise<void> => {
    await updateQuoteStatus(quoteId, 'ACCEPTED', comment, approvalId);
  };

  const reopenQuote = async (quoteId: string): Promise<void> => {
    await updateQuoteStatus(quoteId, 'OPEN', undefined, approvalId);
  };

  const resolveQuoteCheckoutPaymentMethod = async (): Promise<CheckoutPaymentMethod> => {
    const approvalPaymentMethod = approval?.details?.paymentMethods?.[0];

    if (approvalPaymentMethod) {
      return approvalPaymentMethod;
    }

    const fallbackPaymentMode = paymentModes?.[0];

    if (!fallbackPaymentMode) {
      throw new Error('Missing payment method for quote checkout');
    }

    return {
      ...fallbackPaymentMode,
      // TODO: remove this synthetic provider fallback once the payment mode source includes provider for quote checkout.
      provider: 'none',
    };
  };

  const resolveQuoteCheckoutCurrency = (): string | undefined => {
    return (
      approval?.details?.currency ??
      quoteResource?.totalPrice?.currency ??
      quoteResource?.subTotalPrice?.currency ??
      quoteResource?.subtotalAggregate?.currency
    );
  };

  const checkoutApprovedQuote = async (): Promise<string> => {
    if (!approval || !quoteResource) {
      throw new Error('Quote approval data is missing');
    }

    const paymentMethod = await resolveQuoteCheckoutPaymentMethod();

    const request: QuoteCheckoutRequest = {
      quoteId: quoteResource.id,
      paymentMethod,
      customer: {
        userId: approval.requestor.userId,
        firstName: approval.requestor.firstName,
        lastName: approval.requestor.lastName,
        email: approval.requestor.email,
        emailConfirmation: approval.requestor.email,
      },
      currency: resolveQuoteCheckoutCurrency(),
    };

    const response = await checkoutFromQuote(request);

    if (!response.orderId) {
      throw new Error('Order ID is missing in quote checkout response');
    }

    return response.orderId;
  };

  const handleApprove = async () => {
    if (isApprovalActionPending) {
      return;
    }

    try {
      setIsApprovalActionPending(true);
      setActionError(null);
      await updateApprovalStatus('APPROVED');

      if (approval?.resourceType === 'QUOTE') {
        await acceptQuote(approval.resource.id, approverComment || undefined);
      }
      setActionSuccess(t('approvalSuccessfullyApproved'));

      if (approverComment) {
        await updateApproverComment(approverComment);
        setApproverComment('');
      }
    } catch (err) {
      if (approval?.resourceType === 'QUOTE' && approval?.status === 'APPROVED') {
        try {
          await reopenQuote(approval.resource.id);
        } catch (revertError) {
          setActionError(revertError instanceof Error ? revertError.message : String(revertError));
          return;
        }
      }

      setActionError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsApprovalActionPending(false);
    }
  };

  const handleDecline = async () => {
    if (isApprovalActionPending) {
      return;
    }

    try {
      setIsApprovalActionPending(true);
      setActionError(null);
      await updateApprovalStatus('DECLINED');
      setActionSuccess(t('approvalSuccessfullyDeclined'));

      if (approverComment) {
        await updateApproverComment(approverComment);
        setApproverComment('');
      }
    } catch (err) {
      setActionError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsApprovalActionPending(false);
    }
  };

  const handleUpdateApproverComment = async () => {
    try {
      setActionError(null);
      await updateApproverComment(approverComment);
      setActionSuccess(t('approverCommentUpdated'));
      setApproverComment('');
    } catch (err) {
      setActionError(err instanceof Error ? err.message : String(err));
    }
  };

  const handleUpdateRequestorComment = async () => {
    try {
      setActionError(null);
      await updateRequestorComment(requestorComment);
      setActionSuccess(t('requestorCommentUpdated'));
      setRequestorComment('');
    } catch (err) {
      setActionError(err instanceof Error ? err.message : String(err));
    }
  };

  const handleCreateOrder = async (): Promise<void> => {
    if (!quoteResource || isOrderCreationPending) {
      return;
    }

    try {
      setIsOrderCreationPending(true);
      setActionError(null);

      const orderId = await checkoutApprovedQuote();

      setActionSuccess(t('orderSuccessfullySubmitted'));
      setOrderComment('');
      router.push(`/confirmation/${orderId}`);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsOrderCreationPending(false);
    }
  };

  const handleDelete = async () => {
    if (confirm(t('confirmDeleteApproval'))) {
      try {
        setActionError(null);
        await deleteApproval();
        setActionSuccess(t('approvalSuccessfullyDeleted'));
      } catch (err) {
        setActionError(err instanceof Error ? err.message : String(err));
      }
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const formatPrice = (amount?: number, currency?: string) => {
    if (amount === undefined || !currency) {
      return '-';
    }

    return formatCurrency(amount, currency, locale);
  };

  const canApprove = approval?.status === 'PENDING';
  const quoteResource = approval?.resourceType === 'QUOTE' ? (approval.resource as ApprovalQuoteResource) : undefined;
  const quoteItems = quoteResource?.items as ApprovalResourceItem[] | undefined;
  const quoteItemCount = quoteResource?.items?.reduce((total, item) => total + item.quantity, 0) ?? 0;
  const isRequestor = !!approval && currentUserId === approval.requestor.userId;
  const isApprover = !!approval && currentUserId === approval.approver.userId;
  const canComment = approval?.status !== 'CLOSED' && approval?.status !== 'EXPIRED' && (isRequestor || isApprover);
  const canApprovalAction = canApprove && isApprover;
  const canCreateOrder = approval?.status === 'APPROVED' && approval?.resourceType === 'QUOTE' && isApprover;
  const hasApprovalPaymentMethod = !!approval?.details?.paymentMethods?.length;
  const isCreateOrderWaitingForSitePayment = !hasApprovalPaymentMethod && isSiteLoading;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('approvalDetails')}</CardTitle>
          <CardDescription>{t('approvalDetailsDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <div className="flex flex-col items-center space-y-2">
            <Spinner color="primary" variant="md" />
            <div>{t('loading')}</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('approvalDetails')}</CardTitle>
          <CardDescription>{t('approvalDetailsDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-surface-error p-4 rounded-md text-text-error">
            {t('errorLoadingApproval')}: {error.message}
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={() => refreshApproval()}>{t('tryAgain')}</Button>
        </CardFooter>
      </Card>
    );
  }

  if (!approval) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('approvalDetails')}</CardTitle>
          <CardDescription>{t('approvalDetailsDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p className="text-text-placeholders">{t('approvalNotFound')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{t('approvalDetails')}</CardTitle>
            <CardDescription>{t('approvalDetailsDescription')}</CardDescription>
          </div>
          <ApprovalStatusBadge status={approval.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {actionSuccess && (
          <Alert variant="default" className="mb-4">
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>{t('success')}</AlertTitle>
            <AlertDescription>{actionSuccess}</AlertDescription>
          </Alert>
        )}

        {actionError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{t('error')}</AlertTitle>
            <AlertDescription>{actionError}</AlertDescription>
          </Alert>
        )}

        {canCreateOrder && quoteResource && (
          <>
            <Separator />

            <div className="grid grid-cols-1 gap-6">
              <div className="rounded-md bg-surface-action-hover-2 p-6 shadow-sm">
                <div className="rounded-md bg-surface-page p-6">
                  <p className="mb-2 text-sm font-medium">{t('createOrderAfterApprovalTitle')}</p>
                  <p className="mb-4 text-sm text-text-placeholders">{t('createOrderAfterApprovalDescription')}</p>

                  <div className="mb-4">
                    <label htmlFor="approval-order-comment" className="mb-1 block text-sm font-medium">
                      {tQuote('yourComment')}
                    </label>
                    <Textarea
                      id="approval-order-comment"
                      placeholder={tQuote('commentPlaceholder')}
                      className="h-32 w-full resize-none"
                      value={orderComment}
                      onChange={(event) => setOrderComment(event.target.value.slice(0, maxCommentLength))}
                      maxLength={maxCommentLength}
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button variant="secondary" disabled={isOrderCreationPending} onClick={() => setOrderComment('')}>
                      {tQuote('cancel')}
                    </Button>
                    <Button
                      disabled={isOrderCreationPending || isCreateOrderWaitingForSitePayment}
                      onClick={() => {
                        void handleCreateOrder();
                      }}
                    >
                      {isOrderCreationPending ? tQuote('creating') : tQuote('createOrder')}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-text-placeholders">{t('id')}</p>
            <p className="text-base">{approval.id}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-text-placeholders">{t('status')}</p>
            <p className="text-base">{tStatus(approval.status)}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-text-placeholders">{t('resourceType')}</p>
            <p className="text-base">{approval.resourceType}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-text-placeholders">{t('resourceId')}</p>
            <p className="text-base">{approval.resource.id}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-text-placeholders">{t('action')}</p>
            <p className="text-base">{approval.action}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-text-placeholders">{t('createdAt')}</p>
            <p className="text-base">{formatDate(approval.createdAt)}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-text-placeholders">{t('requestorId')}</p>
            <p className="text-base">{approval.requestor.userId}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-text-placeholders">{t('approverId')}</p>
            <p className="text-base">{approval.approver.userId}</p>
          </div>
          {approval.updatedAt && (
            <div>
              <p className="text-sm font-medium text-text-placeholders">{t('updatedAt')}</p>
              <p className="text-base">{formatDate(approval.updatedAt)}</p>
            </div>
          )}
        </div>

        <Separator />

        <div>
          <p className="text-sm font-medium mb-2">{t('requestorComment')}</p>
          {approval.comment ? (
            <div className="bg-surface-disabled p-3 rounded-md">{approval.comment}</div>
          ) : (
            <p className="text-text-placeholders">{t('noRequestorComment')}</p>
          )}
        </div>

        <div>
          <p className="text-sm font-medium mb-2">{t('approverComment')}</p>
          {approval.approverComment ? (
            <div className="bg-surface-disabled p-3 rounded-md">{approval.approverComment}</div>
          ) : (
            <p className="text-text-placeholders">{t('noApproverComment')}</p>
          )}
        </div>

        {quoteResource && (
          <div>
            <p className="text-sm font-medium mb-4">{t('resource')}</p>

            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="rounded-md bg-surface-action-hover-2 p-6 shadow-sm">
                  <SummaryCard
                    heading={tQuote('details')}
                    className="h-full gap-2 rounded-md py-4 shadow-none"
                    icon={<ReceiptText className="h-8 w-8 text-text-action" />}
                    hasHeadline
                  >
                    <div className="space-y-3">
                      <div>
                        <div className="text-lg font-bold">{tQuote('quoteReference')}</div>
                        <div className="text-base">{quoteResource.id}</div>
                      </div>

                      <div>
                        <div className="text-lg font-bold">{tQuote('numberOfProducts')}</div>
                        <div className="text-base">{quoteItemCount}</div>
                      </div>

                      {quoteResource.siteCode && (
                        <div>
                          <div className="text-lg font-bold">{t('siteCode')}</div>
                          <div className="text-base">{quoteResource.siteCode}</div>
                        </div>
                      )}
                    </div>
                  </SummaryCard>
                </div>

                <div className="rounded-md bg-surface-action-hover-2 p-6 shadow-sm">
                  <SummaryCard
                    heading={tQuote('basePrice')}
                    className="h-full gap-2 rounded-md py-4 shadow-none"
                    icon={<List className="h-8 w-8 text-text-action" />}
                    hasHeadline
                  >
                    <div className="space-y-3">
                      <SummaryRow label={tQuote('netValue')} className="text-base">
                        {formatPrice(
                          quoteResource.subtotalAggregate?.netValue,
                          quoteResource.subtotalAggregate?.currency,
                        )}
                      </SummaryRow>
                      <SummaryRow label={tQuote('vat')} className="text-base">
                        {formatPrice(
                          quoteResource.subtotalAggregate?.taxValue,
                          quoteResource.subtotalAggregate?.currency,
                        )}
                      </SummaryRow>
                      <SummaryRow label={tQuote('baseTotal')} strong className="text-base">
                        {formatPrice(
                          quoteResource.subtotalAggregate?.grossValue ?? quoteResource.subTotalPrice?.grossValue,
                          quoteResource.subtotalAggregate?.currency ?? quoteResource.subTotalPrice?.currency,
                        )}
                      </SummaryRow>
                    </div>
                  </SummaryCard>
                </div>

                <div className="rounded-md bg-surface-action-hover-2 p-6 shadow-sm">
                  <SummaryCard
                    heading={tQuote('quotedPrice')}
                    className="h-full gap-2 rounded-md py-4 shadow-none"
                    icon={<ReceiptText className="h-8 w-8 text-text-action" />}
                    hasHeadline
                  >
                    <div className="space-y-3">
                      <SummaryRow label={tQuote('netValue')} className="text-base">
                        {formatPrice(quoteResource.totalPrice?.netValue, quoteResource.totalPrice?.currency)}
                      </SummaryRow>
                      <SummaryRow label={tQuote('vat')} className="text-base">
                        {formatPrice(quoteResource.totalPrice?.taxValue, quoteResource.totalPrice?.currency)}
                      </SummaryRow>
                      <SummaryRow label={tQuote('quotedTotal')} strong className="text-base">
                        {formatPrice(quoteResource.totalPrice?.grossValue, quoteResource.totalPrice?.currency)}
                      </SummaryRow>
                    </div>
                  </SummaryCard>
                </div>
              </div>

              {quoteItems && quoteItems.length > 0 && (
                <ProductListResolver
                  items={quoteItems.map((item) => ({
                    productId: item.productId,
                    itemYrn: item.itemYrn,
                    quantity: item.quantity,
                    unitPrice: item.itemPrice.newUnitPrice ?? item.itemPrice.unitPrice ?? item.itemPrice.amount ?? 0,
                    currency: item.itemPrice.currency,
                  }))}
                />
              )}
            </div>
          </div>
        )}

        {canApprovalAction && (
          <>
            <Separator />

            <div>
              <p className="text-sm font-medium mb-2">{t('approvalActions')}</p>
              <div className="flex gap-2">
                <Button
                  variant="outlineSuccess"
                  onClick={handleApprove}
                  className="hover:bg-surface-action-hover-2"
                  disabled={isApprovalActionPending}
                >
                  {t('approve')}
                </Button>
                <Button onClick={handleDecline} variant="secondary" disabled={isApprovalActionPending}>
                  {t('decline')}
                </Button>
              </div>
            </div>
          </>
        )}

        {canComment && (
          <>
            <Separator />

            {isApprover && (
              <div>
                <p className="text-sm font-medium mb-2">{t('addApproverComment')}</p>
                <Textarea
                  value={approverComment}
                  onChange={(e) => setApproverComment(e.target.value.slice(0, maxCommentLength))}
                  placeholder={t('enterApproverComment')}
                  className="mb-2"
                  maxLength={maxCommentLength}
                />
                <Button onClick={handleUpdateApproverComment} disabled={!approverComment.trim()}>
                  {t('saveApproverComment')}
                </Button>
              </div>
            )}

            {isRequestor && (
              <div>
                <p className="text-sm font-medium mb-2">{t('addRequestorComment')}</p>
                <Textarea
                  value={requestorComment}
                  onChange={(e) => setRequestorComment(e.target.value.slice(0, maxCommentLength))}
                  placeholder={t('enterRequestorComment')}
                  className="mb-2"
                  maxLength={maxCommentLength}
                />
                <Button onClick={handleUpdateRequestorComment} disabled={!requestorComment.trim()}>
                  {t('saveRequestorComment')}
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="neutral" onClick={() => window.history.back()}>
          {t('back')}
        </Button>
        <Button variant="secondary" onClick={handleDelete}>
          {t('delete')}
        </Button>
      </CardFooter>
    </Card>
  );
}
