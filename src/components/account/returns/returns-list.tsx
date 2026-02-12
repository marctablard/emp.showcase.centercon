'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowRight, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useReturns } from '@/hooks/return/useReturns';
import { Link } from '@/i18n/navigation';
import { Return, ReturnStatus } from '@/platform/services/model/return';
import { mockReturns } from './mock-returns-data';
import { ReturnStatusBadge } from './return-status-badge';

interface ReturnsListProps {
  initialReturns?: Return[];
  useMockData?: boolean;
}

export function ReturnsList({ initialReturns, useMockData = true }: ReturnsListProps) {
  const t = useTranslations('account.returns');
  const tStatus = useTranslations('account.returns.status');
  const locale = useLocale();
  const [filterStatus, setFilterStatus] = useState<ReturnStatus | '_ALL_'>('_ALL_');
  const [sortField, setSortField] = useState<'date' | 'value' | 'status' | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const { returns: apiReturns, loading, error, refreshReturns } = useReturns(initialReturns);

  // Use mock data when API returns empty/error and useMockData is enabled
  const shouldUseMockData = useMockData && (apiReturns.length === 0 || error);
  const returns = shouldUseMockData ? mockReturns : apiReturns;
  const effectiveError = shouldUseMockData ? null : error;

  // Filter returns client-side based on selected status
  const filteredReturns =
    filterStatus === '_ALL_'
      ? returns
      : returns.filter(
          (r) => r.status === filterStatus || (filterStatus === ('EXPIRED' as ReturnStatus) && r.isExpired),
        );

  // Sort returns
  const sortedReturns = [...filteredReturns].sort((a, b) => {
    if (!sortField) return 0;

    let comparison = 0;
    switch (sortField) {
      case 'date':
        comparison = new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
        break;
      case 'value':
        comparison = (a.total?.value || 0) - (b.total?.value || 0);
        break;
      case 'status':
        comparison = a.status.localeCompare(b.status);
        break;
    }

    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const toggleSort = (field: 'date' | 'value' | 'status') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  };

  const formatCurrency = (value?: number, currency?: string) => {
    if (value === undefined || !currency) return '-';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
    }).format(value);
  };

  const getFirstOrderId = (returnItem: Return): string => {
    return returnItem.orders[0]?.id || '-';
  };

  const getRequestorEmail = (returnItem: Return): string => {
    return returnItem.requestor?.email || '-';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-[48px] font-bold leading-[52px]">{t('title')}</CardTitle>
          <CardDescription>{t('description')}</CardDescription>
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

  if (effectiveError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-[48px] font-bold leading-[52px]">{t('title')}</CardTitle>
          <CardDescription>{t('description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-surface-error p-4 rounded-md text-text-error">
            {t('errorLoading')}: {effectiveError.message}
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={() => refreshReturns()}>{t('tryAgain')}</Button>
        </CardFooter>
      </Card>
    );
  }

  if (returns.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-[48px] font-bold leading-[52px]">{t('title')}</CardTitle>
          <CardDescription>{t('description')}</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p className="text-text-placeholders">{t('noReturns')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Title - matches Figma h1 styling */}
      <h1 className="text-[48px] font-bold leading-[52px] text-text-headings font-primary">{t('title')}</h1>

      {/* Filter and Table Container */}
      <div className="bg-surface-primary border border-border-primary rounded-md p-4">
        <div className="mb-4 flex flex-wrap gap-4">
          <div className="min-w-[200px]">
            <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as ReturnStatus | '_ALL_')}>
              <SelectTrigger>
                <SelectValue placeholder={t('filterByStatus')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_ALL_">{t('allStatuses')}</SelectItem>
                <SelectItem value="PENDING">{tStatus('PENDING')}</SelectItem>
                <SelectItem value="APPROVED">{tStatus('APPROVED')}</SelectItem>
                <SelectItem value="REJECTED">{tStatus('REJECTED')}</SelectItem>
                <SelectItem value="CLOSED">{tStatus('CLOSED')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-medium">{t('returnNumber')}</TableHead>
              <TableHead className="font-medium">
                <button onClick={() => toggleSort('date')} className="flex items-center gap-1 hover:text-text-action">
                  {t('returnDate')}
                  <ChevronsUpDown className="h-4 w-4" />
                </button>
              </TableHead>
              <TableHead className="font-medium">{t('orderNumber')}</TableHead>
              <TableHead className="font-medium">{t('email')}</TableHead>
              <TableHead className="font-medium">
                <button onClick={() => toggleSort('value')} className="flex items-center gap-1 hover:text-text-action">
                  {t('returnValue')}
                  <ChevronsUpDown className="h-4 w-4" />
                </button>
              </TableHead>
              <TableHead className="font-medium">
                <button onClick={() => toggleSort('status')} className="flex items-center gap-1 hover:text-text-action">
                  {t('statusLabel')}
                  <ChevronsUpDown className="h-4 w-4" />
                </button>
              </TableHead>
              <TableHead className="font-medium text-right">{t('view')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedReturns.map((returnItem) => (
              <TableRow key={returnItem.id} className="border-t border-border-primary">
                <TableCell>
                  <Link
                    href={`/account/returns/${returnItem.id}`}
                    className="text-text-action underline decoration-solid font-bold hover:text-text-action/80"
                  >
                    {returnItem.id}
                  </Link>
                </TableCell>
                <TableCell>{formatDate(returnItem.createdAt)}</TableCell>
                <TableCell>{getFirstOrderId(returnItem)}</TableCell>
                <TableCell>{getRequestorEmail(returnItem)}</TableCell>
                <TableCell>{formatCurrency(returnItem.total?.value, returnItem.total?.currency)}</TableCell>
                <TableCell>
                  <ReturnStatusBadge status={returnItem.status} isExpired={returnItem.isExpired} />
                </TableCell>
                <TableCell className="text-right">
                  <Link href={`/account/returns/${returnItem.id}`} className="inline-flex items-center justify-end">
                    <ArrowRight className="h-6 w-6 text-text-headings hover:text-text-action" />
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
