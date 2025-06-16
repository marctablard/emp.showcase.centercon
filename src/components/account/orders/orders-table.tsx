'use client';

import { useTranslations } from 'next-intl';
import { format } from 'date-fns';
import { Eye } from 'lucide-react';
import UiLink from '@/components/ui/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Order } from '@/platform/services/model/order/order';
import { OrderStatusBadge } from './order-status-badge';

/**
 * Orders Table component
 * Displays a table of orders with their details
 */
export function OrdersTable({ orders }: { orders: Order[] }) {
  const tOrder = useTranslations('Orders');

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{tOrder('orderNumber')}</TableHead>
          <TableHead>{tOrder('orderDate')}</TableHead>
          <TableHead>{tOrder('status')}</TableHead>
          <TableHead>{tOrder('total')}</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => (
          <TableRow key={order.id}>
            <TableCell className="font-medium">#{order.id}</TableCell>
            <TableCell>{order.createdAt ? format(new Date(order.createdAt), 'dd.MM.yyyy') : '-'}</TableCell>
            <TableCell>
              <OrderStatusBadge status={order.status} />
            </TableCell>
            <TableCell>
              {order.price?.total.gross} {order.currency}
            </TableCell>
            <TableCell className="text-right">
              <UiLink href={`/account/orders/${order.id}`} type="Link">
                <Eye className="h-4 w-4 mr-2" />
              </UiLink>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
