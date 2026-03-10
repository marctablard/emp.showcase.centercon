'use client';

import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { ReturnStatus } from '@/platform/services/model/return';

type BadgeVariant = 'default' | 'success' | 'secondary' | 'warning' | 'destructive' | 'outline';

interface ReturnStatusBadgeProps {
  status: ReturnStatus;
  isExpired?: boolean;
}

export function ReturnStatusBadge({ status, isExpired }: ReturnStatusBadgeProps) {
  const t = useTranslations('account.returns.status');

  if (isExpired) {
    return <Badge variant="outline">{t('EXPIRED')}</Badge>;
  }

  const getVariant = (): BadgeVariant => {
    switch (status) {
      case 'APPROVED':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'REJECTED':
        return 'destructive';
      case 'CLOSED':
        return 'secondary';
      default:
        return 'default';
    }
  };

  return <Badge variant={getVariant()}>{t(status)}</Badge>;
}
