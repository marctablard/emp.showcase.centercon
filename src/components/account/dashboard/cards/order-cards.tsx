'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ShoppingBag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useOrder } from '@/hooks/order/useOrder';
import { Order } from '@/platform/services/model/order/order';
import { DashboardCard, DashboardCardProps } from './dashboard-card';
import { StatCard } from './stat-card';

/**
 * Order Summary Card component
 * Shows the total number of orders and orders in progress
 */
export function OrderSummaryCard({ className, title, ...props }: Omit<DashboardCardProps, 'children'>) {
  const t = useTranslations('Account');
  const { orders, loading } = useOrder();

  // Calculate order counts
  const totalOrders = orders.length;
  const inProgressOrders = orders.filter((order) =>
    ['IN_CHECKOUT', 'CREATED', 'CONFIRMED', 'PROCESSING'].includes(order.status),
  ).length;

  return (
    <StatCard
      title={title || t('orders')}
      value={`${inProgressOrders} / ${totalOrders}`}
      description={t('ordersInProgress', { count: inProgressOrders })}
      icon={<ShoppingBag className="h-4 w-4" />}
      className={className}
      {...props}
    />
  );
}

/**
 * Order status badge component
 * Displays a badge with appropriate color based on order status
 */
function OrderStatusBadge({ status }: { status: Order['status'] }) {
  const t = useTranslations('Orders');

  const getVariant = () => {
    switch (status) {
      case 'DELIVERED':
      case 'COMPLETED':
        return 'success';
      case 'PROCESSING':
      case 'CONFIRMED':
      case 'READY_FOR_PICKUP':
      case 'READY_FOR_SHIPPING':
        return 'warning';
      case 'CANCELLED':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return <Badge variant={getVariant()}>{t(status.toLowerCase())}</Badge>;
}

/**
 * Recent Orders Card component
 * Shows the most recent orders with their status
 */
export function RecentOrdersCard({ className, title, ...props }: Omit<DashboardCardProps, 'children'>) {
  const t = useTranslations('Account');
  const { orders, loading } = useOrder();

  // Sort orders by creation date (newest first) and take the first 6
  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime())
    .slice(0, 6);

  return (
    <DashboardCard title={title || t('recentOrders')} className={className} {...props}>
      <div className="flex items-center justify-between mb-4">
        <Badge variant="secondary">{orders.length}</Badge>
      </div>
      <div className="space-y-4">
        {loading ? (
          <p className="text-sm text-muted-foreground">{t('loading')}</p>
        ) : recentOrders.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('noOrders')}</p>
        ) : (
          recentOrders.map((order) => (
            <div key={order.id} className="border-b pb-3 last:border-0 last:pb-0">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="text-sm font-medium">
                    {t('orderNumber')}{' '}
                    <Link href={`/account/orders/${order.id}`} className="hover:underline">
                      #{order.id}
                    </Link>
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    {order.items.length} {t('items')} · {order.price?.total.gross} {order.currency}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <OrderStatusBadge status={order.status} />
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {order.createdAt && formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
        <div className="text-center">
          <Link href="/account/orders" className="text-xs text-primary hover:underline">
            {t('viewAllOrders')}
          </Link>
        </div>
      </div>
    </DashboardCard>
  );
}

export default RecentOrdersCard;
