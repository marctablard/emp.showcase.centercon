'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { format } from 'date-fns';
import { Ban, RotateCcw, ShoppingCart, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { H2, H3 } from '@/components/ui/h';
import UiLink from '@/components/ui/link';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ToastType, notify } from '@/components/ui/toast-notification';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useCart } from '@/hooks/cart/useCart';
import { useOrder } from '@/hooks/order/useOrder';
import { useToast } from '@/hooks/ui/useToast';
import { type PaymentModeKey, dk } from '@/i18n/dynamic-key';
import { useRouter } from '@/i18n/navigation';
import { fetchReturnsForOrder } from '@/lib/client/returns';
import { ORDER_CUSTOMER_DECLINE_NOT_ALLOWED_MESSAGE } from '@/lib/common/order-customer-decline-not-allowed';
import { canReorder, reorderOrderItems } from '@/lib/common/orders/reorder';
import { type OrderReturnability, computeOrderReturnability } from '@/lib/common/returns/returnability';
import { getLogger } from '@/lib/logger/use-logger-client';
import type { Order, OrderStatus } from '@/platform/services/model/order/order';
import { ORDER_STATUS } from '@/platform/services/model/order/order-status';
import { CreateReturnDialog } from './create-return-dialog';
import { OrderStatusBadge } from './order-status-badge';
import { TrackingDialog } from './tracking-dialog';

function shouldShowCancelButton(status: OrderStatus, transitions: string[]): boolean {
  return status === ORDER_STATUS.CREATED && transitions.includes('DECLINED');
}

function shouldShowReturnButton(status: OrderStatus): boolean {
  return status === ORDER_STATUS.COMPLETED;
}

/**
 * Order Detail component
 * Displays detailed information for a single order
 */
export function OrderDetail({ orderId, initialOrder }: { orderId: string; initialOrder?: Order | null }) {
  const tOrder = useTranslations('orders');
  const tPaymentModes = useTranslations('checkout.PaymentModes');
  const [trackingDialogOpen, setTrackingDialogOpen] = useState(false);
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [returnability, setReturnability] = useState<OrderReturnability | null>(null);
  const [isReordering, setIsReordering] = useState(false);
  const router = useRouter();
  const { addItem } = useCart();
  const { toast } = useToast();

  const { order, loading, error, cancelOrder, statusTransitions } = useOrder({ orderId, initialOrder });

  useEffect(() => {
    if (!order || order.status !== ORDER_STATUS.COMPLETED) return;
    let cancelled = false;
    const syncReturnability = async () => {
      try {
        const existingReturns = await fetchReturnsForOrder(order.id);
        if (cancelled) return;
        setReturnability(computeOrderReturnability(order.id, order.items, existingReturns));
      } catch (_error) {
        if (!cancelled) setReturnability(null);
      }
    };
    void syncReturnability();
    return () => {
      cancelled = true;
    };
  }, [order]);

  const handleReorder = useCallback(async () => {
    if (!order || !canReorder(order)) {
      return;
    }

    setIsReordering(true);
    try {
      const { total, failed } = await reorderOrderItems(order, addItem);

      if (failed.length > 0) {
        for (const item of failed) {
          getLogger().error({ productId: item.productId, orderId: order.id }, 'Failed to reorder item');
        }
      }

      if (failed.length === 0) {
        toast({ title: tOrder('reorderAddedToCart'), variant: 'success' });
      } else if (failed.length < total) {
        toast({
          title: tOrder('reorderPartialFailure', { failed: failed.length }),
          variant: 'destructive',
          persistent: true,
        });
      } else {
        toast({ title: tOrder('reorderFailed'), variant: 'destructive', persistent: true });
      }
    } finally {
      setIsReordering(false);
    }
  }, [addItem, order, tOrder, toast]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-8 w-64" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-48" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !order) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-text-error">{tOrder('errorFetchingOrder')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>
                <H2 variant="h4">{tOrder('orderDetails')}</H2>
              </CardTitle>
              <CardDescription>
                {tOrder('orderNumber')} #{order.id}
              </CardDescription>
            </div>
            <div>
              <OrderStatusBadge status={order.status} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <H3 variant="h5" className="mb-2">
                {tOrder('orderDate')}
              </H3>
              <p>{order.createdAt ? format(new Date(order.createdAt), 'PPP') : '-'}</p>

              {order.customerEmail && (
                <>
                  <H3 variant="h5" className="mb-2 mt-4">
                    {tOrder('email')}
                  </H3>
                  <p>{order.customerEmail}</p>
                </>
              )}

              {order.payments && order.payments.length > 0 && (
                <>
                  <H3 variant="h5" className="mb-2 mt-4">
                    {tOrder('paymentMethod')}
                  </H3>
                  <p>{tPaymentModes(dk<PaymentModeKey>(order.payments[0].method.toLowerCase()))}</p>
                </>
              )}

              {order.quoteId ? (
                <>
                  <H3 variant="h5" className="mb-2 mt-4">
                    {tOrder('relatedQuote')}
                  </H3>
                  <UiLink href={`/account/quotes/${order.quoteId}`} type="Link">
                    #{order.quoteId}
                  </UiLink>
                </>
              ) : null}
            </div>

            {order.shippingAddress && (
              <div>
                <H3 variant="h5" className="mb-2">
                  {tOrder('shippingAddress')}
                </H3>
                <p>
                  {order.shippingAddress.contactName}
                  <br />
                  {order.shippingAddress.street} {order.shippingAddress.streetNumber || ''}
                  <br />
                  {order.shippingAddress.zipCode} {order.shippingAddress.city}
                  <br />
                  {order.shippingAddress.country}
                </p>
              </div>
            )}
          </div>

          <div className="mt-8">
            <H3 variant="h5" className="mb-4">
              {tOrder('orderItems')}
            </H3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{tOrder('product')}</TableHead>
                  <TableHead className="text-right">{tOrder('quantity')}</TableHead>
                  <TableHead className="text-right">{tOrder('price')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.items.map((item) => (
                  <TableRow
                    className="cursor-pointer hover:bg-surface-action-hover-2"
                    key={item.id}
                    onClick={() => router.push(`/product/${item.productId}`)}
                  >
                    <TableCell>
                      <div className="font-medium">{item.name || item.productId}</div>
                      {item.sku && <div className="text-sm text-text-placeholders">SKU: {item.sku}</div>}
                    </TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">
                      {item.price ? (
                        <>
                          {item.price.value} {item.price.currency}
                        </>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="mt-6 border-t pt-6">
            <div className="flex justify-between mb-2">
              <span>{tOrder('subtotal')}</span>
              <span>
                {order.price?.subtotal.gross} {order.currency}
              </span>
            </div>

            {order.shipping && (
              <div className="flex justify-between mb-2">
                <span>{tOrder('shipping')}</span>
                <span>
                  {order.shipping.total.value === 0
                    ? tOrder('free')
                    : `${order.shipping.total.value} ${order.shipping.total.currency}`}
                </span>
              </div>
            )}

            {order.discounts && order.discounts.length > 0 && (
              <div className="flex justify-between mb-2">
                <span>{tOrder('discount')}</span>
                <span>
                  -{order.discounts[0].value} {order.discounts[0].currency}
                </span>
              </div>
            )}

            <div className="flex justify-between font-bold mt-4 pt-4 border-t">
              <span>{tOrder('total')}</span>
              <span>
                {order.price?.total.gross} {order.currency}
              </span>
            </div>
          </div>
        </CardContent>
        {/* Order action buttons at the bottom */}
        {(canReorder(order) ||
          shouldShowCancelButton(order.status, statusTransitions) ||
          shouldShowReturnButton(order.status) ||
          (
            [
              ORDER_STATUS.PROCESSING,
              ORDER_STATUS.READY_FOR_SHIPPING,
              ORDER_STATUS.READY_FOR_PICKUP,
              ORDER_STATUS.SHIPPED,

              ORDER_STATUS.DELIVERED,
            ] as OrderStatus[]
          ).includes(order.status)) && (
          <CardFooter className="flex flex-col items-start pt-6 border-t">
            <H2 variant="h5" className="mb-3">
              {tOrder('orderActions')}
            </H2>
            <div className="flex flex-wrap gap-2">
              {canReorder(order) ? (
                <Button variant="secondary" size="small" disabled={isReordering} onClick={() => void handleReorder()}>
                  {isReordering ? <Spinner variant="sm" className="mr-2" /> : <ShoppingCart className="mr-2 h-4 w-4" />}
                  {tOrder('reorderLink')}
                </Button>
              ) : (
                <Tooltip delayDuration={200}>
                  <TooltipTrigger asChild>
                    <span>
                      <Button variant="secondary" size="small" disabled>
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        {tOrder('reorderLink')}
                      </Button>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent className="w-[22rem] max-w-[calc(100vw-2rem)] text-wrap">
                    {tOrder('reorderDisabledTooltip')}
                  </TooltipContent>
                </Tooltip>
              )}
              {shouldShowCancelButton(order.status, statusTransitions) && cancelOrder && (
                <Button
                  variant="secondary"
                  size="small"
                  onClick={async () => {
                    try {
                      await cancelOrder();
                    } catch (err) {
                      getLogger().error({ err }, 'Failed to cancel order');
                      const message = err instanceof Error ? err.message : '';
                      const description =
                        message === ORDER_CUSTOMER_DECLINE_NOT_ALLOWED_MESSAGE
                          ? tOrder('cancelOrderNotAllowed')
                          : message || tOrder('cancelOrderFailedUnknown');
                      notify({
                        title: tOrder('cancelOrderFailed'),
                        description,
                        type: ToastType.Error,
                      });
                    }
                  }}
                >
                  <Ban className="mr-2 h-4 w-4" />
                  {tOrder('cancelOrder')}
                </Button>
              )}
              {shouldShowReturnButton(order.status) &&
                (returnability?.hasAnyReturnableItem === false ? (
                  <Tooltip delayDuration={200}>
                    <TooltipTrigger asChild>
                      <span>
                        <Button variant="secondary" size="small" disabled>
                          <RotateCcw className="mr-2 h-4 w-4" />
                          {tOrder('returnOrder')}
                        </Button>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent className="w-[22rem] max-w-[calc(100vw-2rem)] text-wrap">
                      {tOrder('noRemainingItems')}
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <Button variant="secondary" size="small" onClick={() => setReturnDialogOpen(true)}>
                    <RotateCcw className="mr-2 h-4 w-4" />
                    {tOrder('returnOrder')}
                  </Button>
                ))}
              {(
                [
                  ORDER_STATUS.PROCESSING,
                  ORDER_STATUS.READY_FOR_SHIPPING,
                  ORDER_STATUS.READY_FOR_PICKUP,
                  ORDER_STATUS.SHIPPED,

                  ORDER_STATUS.DELIVERED,
                  ORDER_STATUS.COMPLETED,
                ] as OrderStatus[]
              ).includes(order.status) && (
                <Button variant="secondary" size="small" onClick={() => setTrackingDialogOpen(true)}>
                  <Truck className="mr-2 h-4 w-4" />
                  {tOrder('trackOrder')}
                </Button>
              )}
            </div>
          </CardFooter>
        )}
      </Card>

      {/* Tracking Dialog */}
      <TrackingDialog orderId={orderId} open={trackingDialogOpen} onOpenChange={setTrackingDialogOpen} />

      {order && (
        <CreateReturnDialog
          order={order}
          open={returnDialogOpen}
          onOpenChange={setReturnDialogOpen}
          returnability={returnability ?? undefined}
        />
      )}
    </div>
  );
}
