'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { ApprovalSummary } from '@/components/account/approvals/approval-summary';
import { ProductListResolver } from '@/components/product/product-list-resolver';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useApproval } from '@/hooks/approval/useApproval';
import useCustomer from '@/hooks/customer/useCustomer';
import { useToast } from '@/hooks/ui/useToast';
import { checkoutApproval as checkoutApi } from '@/lib/client/checkout';
import { Approval } from '@/platform/services/model/approval';
import type { CheckoutRequest } from '@/platform/services/model/checkout';
import { ApprovalStatusBadge } from './approval-status-badge';

interface ApprovalDetailsProps {
  approvalId: string;
  initialApproval?: Approval;
}

export function ApprovalDetails({ approvalId, initialApproval }: ApprovalDetailsProps) {
  const t = useTranslations('orders.Approval');
  const tStatus = useTranslations('orders.ApprovalStatus');
  const router = useRouter();
  const { toast } = useToast();
  const { customer, loading: customerLoading } = useCustomer();
  const [comment, setComment] = useState<string>('');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

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

  const isRequestor = approval?.requestor.userId === customer?.id;

  const handleApprove = async () => {
    if (isRequestor || !customer?.roles?.find((role) => role === 'B2B_ADMIN')) {
      return;
    }
    try {
      if (isProcessing) return;
      setActionError(null);

      setIsProcessing(true);
      const checkoutResponse = await handleSubmitOrder();
      if (!checkoutResponse) {
        throw new Error('Checkout failed');
      }

      // Navigate after successful approve + checkout
      toast({ title: t('success'), description: t('orderSuccessfullySubmitted'), variant: 'success' });
      router.push(`/account/approvals`);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDecline = async () => {
    if (isRequestor || !customer?.roles?.find((role) => role === 'B2B_ADMIN')) {
      return;
    }
    try {
      setActionError(null);
      await updateApprovalStatus('DECLINED');
      setActionSuccess(t('approvalSuccessfullyDeclined'));

      if (comment) {
        if (isRequestor) {
          await updateRequestorComment(comment);
        } else {
          await updateApproverComment(comment);
        }
        setComment('');
      }
    } catch (err) {
      setActionError(err instanceof Error ? err.message : String(err));
    }
  };

  const handleComment = async () => {
    try {
      setActionError(null);
      if (isRequestor) {
        await updateRequestorComment(comment);
      } else {
        await updateApproverComment(comment);
      }
      setActionSuccess(t('requestorCommentUpdated'));
      setComment('');
    } catch (err) {
      setActionError(err instanceof Error ? err.message : String(err));
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

  const handleSubmitOrder = async () => {
    if (!approval) return;
    try {
      setActionError(null);

      const cartId = approval.resource.id;
      const details = approval.details;
      const customer = approval.requestor;

      if (!details) {
        throw new Error('Missing approval details for checkout');
      }

      if (!details.addresses || details.addresses.length < 2) {
        throw new Error('Both shipping and billing addresses are required');
      }

      if (!details.shipping) {
        throw new Error('Missing shipping details');
      }

      if (!details.paymentMethods || details.paymentMethods.length === 0) {
        throw new Error('Missing payment method');
      }

      const request: CheckoutRequest = {
        cartId,
        addresses: details.addresses,
        shipping: details.shipping,
        paymentMethod: details.paymentMethods[0],
        customer: {
          userId: customer.userId,
          firstName: customer.firstName,
          lastName: customer.lastName,
          email: customer.email,
          emailConfirmation: customer.email,
        },
        summary: { termsAndConditions: true },
        currency: details.currency,
      };

      const response = await checkoutApi(request);

      return response;
    } catch (err) {
      setActionError(err instanceof Error ? err.message : String(err));
      throw err;
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

  if (loading || customerLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('approvalDetails')}</CardTitle>
          <CardDescription>{t('approvalDetailsDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <div className="flex flex-col items-center space-y-2">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            <div>{t('loading')}</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !approval) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('approvalDetails')}</CardTitle>
          <CardDescription>{t('approvalDetailsDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-destructive/10 p-4 rounded-md text-destructive">
            {t('errorLoadingApproval')}: {error?.message || t('approvalNotFound')}
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={() => refreshApproval()}>{t('tryAgain')}</Button>
        </CardFooter>
      </Card>
    );
  }

  const canApprove = approval.status === 'PENDING' && customer?.roles?.includes('B2B_ADMIN');
  const canSubmitOrder = approval.status === 'APPROVED';
  const canComment = approval.status === 'PENDING';
  const canDelete = approval.status === 'PENDING' && isRequestor;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-4">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">{t('id')}</h3>
            <p className="text-base">{approval.id}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">{t('status')}</h3>
            <p className="text-base">{tStatus(approval.status)}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">{t('resourceType')}</h3>
            <p className="text-base">{approval.resourceType}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">{t('resourceId')}</h3>
            <p className="text-base">{approval.resource.id}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">{t('action')}</h3>
            <p className="text-base">{approval.action}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">{t('createdAt')}</h3>
            <p className="text-base">{formatDate(approval.createdAt)}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">{t('requestorId')}</h3>
            <p className="text-base">{approval.requestor.userId}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">{t('approverId')}</h3>
            <p className="text-base">{approval.approver.userId}</p>
          </div>
          {approval.updatedAt && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">{t('updatedAt')}</h3>
              <p className="text-base">{formatDate(approval.updatedAt)}</p>
            </div>
          )}
        </div>

        <Separator />

        <ApprovalSummary approval={approval} />

        {approval.resource.items && approval.resource.items.length > 0 && (
          <ProductListResolver
            items={approval.resource.items.map((it) => ({
              productId: it.productId,
              itemYrn: it.itemYrn,
              quantity: it.quantity,
              unitPrice: it.itemPrice.amount,
              currency: it.itemPrice.currency,
            }))}
          />
        )}

        <div>
          <h3 className="text-sm font-medium mb-2">{t('requestorComment')}</h3>
          {approval.comment ? (
            <div className="bg-muted p-3 rounded-md">{approval.comment}</div>
          ) : (
            <p className="text-muted-foreground">{t('noRequestorComment')}</p>
          )}
        </div>

        <div>
          <h3 className="text-sm font-medium mb-2">{t('approverComment')}</h3>
          {approval.approverComment ? (
            <div className="bg-muted p-3 rounded-md">{approval.approverComment}</div>
          ) : (
            <p className="text-muted-foreground">{t('noApproverComment')}</p>
          )}
        </div>

        {canApprove && (
          <>
            <Separator />

            <div>
              <h3 className="text-sm font-medium mb-2">{t('approvalActions')}</h3>
              <div className="flex gap-2">
                <Button onClick={handleApprove} disabled={isProcessing} className="bg-green-600 hover:bg-green-700">
                  {t('approve')}
                </Button>
                <Button onClick={handleDecline} disabled={isProcessing} variant="secondary">
                  {t('decline')}
                </Button>
              </div>
            </div>
          </>
        )}

        {/* {canSubmitOrder && (
          <>
            <Separator />

            <div>
              <h3 className="text-sm font-medium mb-2">{t('approvalActions')}</h3>
              <div className="flex gap-2">
                <Button onClick={handleSubmitOrder} disabled={isSubmitting} className="bg-green-600 hover:bg-green-700">
                  {t('submitOrder')}
                </Button>
              </div>
            </div>
          </>
        )} */}

        {canComment && (
          <>
            <Separator />

            <div>
              <h3 className="text-sm font-medium mb-2">{t('addComment')}</h3>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={t('enterComment')}
                className="mb-2"
              />
              <Button onClick={handleComment} disabled={!comment.trim()}>
                {t('saveComment')}
              </Button>
            </div>
          </>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="neutral" onClick={() => window.history.back()}>
          {t('back')}
        </Button>
        {canDelete && (
          <Button variant="secondary" onClick={handleDelete}>
            {t('delete')}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
