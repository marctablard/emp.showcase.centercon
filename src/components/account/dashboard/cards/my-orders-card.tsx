'use client';

import React, { useMemo, useState } from 'react';
import { FormProvider } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { format } from 'date-fns';
import { ArrowRight, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/dashboard-badge';
import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import UiLink from '@/components/ui/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useOrders } from '@/hooks/order/useOrders';
import { useValidator } from '@/hooks/validation/useValidator';
import { cn } from '@/lib/utils';
import { DashboardCard, DashboardCardProps } from './dashboard-card';

type OrderSearchFormData = {
  searchQuery: string;
};

interface MyOrdersCardProps extends Omit<DashboardCardProps, 'children'> {
  className?: string;
}

export function MyOrdersCard({ className, title, ...props }: MyOrdersCardProps) {
  const t = useTranslations('Orders');

  const { form } = useValidator('OrderSearchValidationService', {
    searchQuery: '',
  });

  const handleSearch = (data: OrderSearchFormData) => {
    console.log('Searching for:', data.searchQuery);
    // Implement search functionality here
  };

  // Fetch orders from the hook
  const { orders, loading } = useOrders();

  // Get the appropriate status badge variant
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'IN_CHECKOUT':
        return { variant: 'default' as const };
      case 'CREATED':
        return { variant: 'default' as const };
      case 'CONFIRMED':
        return { variant: 'warning' as const };
      case 'PROCESSING':
        return { variant: 'warning' as const };
      case 'READY_FOR_PICKUP':
        return { variant: 'warning' as const };
      case 'READY_FOR_SHIPPING':
        return { variant: 'warning' as const };
      case 'SHIPPED':
        return { variant: 'success' as const };
      case 'DELIVERED':
        return { variant: 'success' as const };
      case 'COMPLETED':
        return { variant: 'success' as const };
      case 'CANCELLED':
        return { variant: 'default' as const };
      default:
        return { variant: 'default' as const };
    }
  };

  // Format date in the current locale
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '-';
    return format(new Date(dateString), 'dd.MM.yyyy');
  };

  // Format address
  const formatAddress = (address: any) => {
    if (!address) return '-';
    return `${address.city}, ${address.country}`;
  };

  // Format payment method
  const formatPayment = (payments: any[] | undefined) => {
    if (!payments || payments.length === 0) return '-';
    // Use the translation for the payment method if available
    return t(`paymentTypes.${payments[0].method.toLowerCase()}`) || payments[0].method;
  };

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const ordersPerPage = 5; // Anzahl der Bestellungen pro Seite

  // Get paginated orders
  const visibleOrders = useMemo(() => {
    if (!orders) return [];
    const startIndex = (currentPage - 1) * ordersPerPage;
    const endIndex = startIndex + ordersPerPage;
    return orders
      .slice()
      .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime())
      .slice(startIndex, endIndex);
  }, [orders, currentPage, ordersPerPage]);

  // Pagination handlers
  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    if (orders) {
      const maxPage = Math.ceil(orders.length / ordersPerPage);
      setCurrentPage((prev) => Math.min(prev + 1, maxPage));
    }
  };

  return (
    <DashboardCard variant="default" className={cn('py-4 pb-0', className)} {...props}>
      <div className="flex items-center justify-between mb-4">
        <CardTitle className="text-4xl font-bold">{title || t('myOrders')}</CardTitle>
        <UiLink type="Link" href="/account/orders" variant="primary" size="m" iconAfter={<ArrowRight />}>
          {t('showAllOrders')}
        </UiLink>
      </div>
      {/* search */}
      <div className="mb-4 w-[60%]">
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(handleSearch)} className="w-full">
            <FormField
              control={form.control}
              name="searchQuery"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder={t('search.placeholder')} endIcon={Search} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </FormProvider>
      </div>
      <div className="flex flex-col">
        <Table>
          <TableHeader>
            <TableRow className="text-base">
              <TableHead className="w-[120px] font-bold">{t('columns.orderNumber')}</TableHead>
              <TableHead className="w-[100px] font-bold">{t('columns.status')}</TableHead>
              <TableHead className="w-[100px] font-bold">{t('columns.orderDate')}</TableHead>
              <TableHead className="w-[100px] font-bold">{t('columns.deliveryDate')}</TableHead>
              <TableHead className="w-[150px] font-bold">{t('columns.deliveryAddress')}</TableHead>
              <TableHead className="w-[120px] font-bold">{t('columns.payment')}</TableHead>
              <TableHead className="w-[100px] font-bold text-right">{t('columns.orderValue')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-4">
                  {t('loading')}
                </TableCell>
              </TableRow>
            ) : visibleOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-4">
                  {t('noOrders')}
                </TableCell>
              </TableRow>
            ) : (
              visibleOrders.map((order, index) => (
                <TableRow
                  key={order.id}
                  className={cn(
                    'hover:bg-neutral-50 cursor-pointer text-base',
                    index % 2 === 0 ? 'bg-white' : 'bg-neutral-50',
                  )}
                  onClick={() => (window.location.href = `/account/orders/${order.id}`)}
                >
                  <TableCell className="px-2 py-4 font-medium">
                    <UiLink type="Link" href={`/account/orders/${order.id}`} variant="primary" size="m">
                      #{order.id}
                    </UiLink>
                  </TableCell>
                  <TableCell className="px-2 py-4">
                    <Badge variant={getStatusBadge(order.status).variant}>
                      {t(`status.${order.status.toLowerCase()}`)}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-2 py-4">{formatDate(order.lastStatusChange)}</TableCell>
                  <TableCell className="px-2 py-4">
                    {/* Use lastStatusChange as an approximation for delivery date */}
                    {/*formatDate(order.lastStatusChange)*/}-
                  </TableCell>
                  <TableCell className="px-2 py-4">{formatAddress(order.shippingAddress)}</TableCell>
                  <TableCell className="px-2 py-4">{formatPayment(order.payments)}</TableCell>
                  <TableCell className="text-right py-4 font-medium">
                    {order.price?.total.gross} {order.currency}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end p-3">
        <div className="flex items-center justify-between mt-2">
          {orders && orders.length > ordersPerPage && (
            <div className="flex items-center space-x-6">
              {currentPage > 1 && (
                <Button variant="neutral" size="small" onClick={handlePreviousPage}>
                  <ChevronLeft className="h-4 w-4" />
                  {t('previous')}
                </Button>
              )}
              <span className="text-sm">
                {currentPage * ordersPerPage} / {orders?.length || 0}
              </span>
              {currentPage < Math.ceil(orders.length / ordersPerPage) && (
                <Button variant="neutral" size="small" onClick={handleNextPage}>
                  {t('next')} <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardCard>
  );
}
