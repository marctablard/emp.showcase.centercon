'use client';

import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { ApprovalStatus } from '@/platform/services/model/approval';

interface ApprovalStatusBadgeProps {
  status: ApprovalStatus;
}

export function ApprovalStatusBadge({ status }: ApprovalStatusBadgeProps) {
  const t = useTranslations('ApprovalStatus');

  const getVariant = () => {
    switch (status) {
      case 'APPROVED':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'DECLINED':
        return 'destructive';
      case 'EXPIRED':
        return 'neutral';
      case 'CLOSED':
        return 'secondary';
      default:
        return 'neutral';
    }
  };

  return <Badge variant={getVariant() as any}>{t(status)}</Badge>;
}
