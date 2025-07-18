'use client';

import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { ApprovalStatus } from '@/platform/services/model/approval';

interface ApprovalStatusBadgeProps {
  status: ApprovalStatus;
  className?: string;
}

export function ApprovalStatusBadge({ status, className = '' }: ApprovalStatusBadgeProps) {
  const t = useTranslations('ApprovalStatus');

  const getStatusVariant = (status: ApprovalStatus) => {
    switch (status) {
      case 'APPROVED':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'DECLINED':
        return 'destructive';
      case 'EXPIRED':
        return 'outline';
      case 'CLOSED':
        return 'secondary';
      default:
        return 'default';
    }
  };

  return (
    <Badge variant={getStatusVariant(status)} className={className}>
      {t(status)}
    </Badge>
  );
}
