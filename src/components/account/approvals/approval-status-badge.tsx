'use client';

import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { getApprovalStatusVariant } from '@/lib/common/status-tag-variants';
import { cn } from '@/lib/utils';
import type { ApprovalStatus } from '@/platform/services/model/approval';

interface ApprovalStatusBadgeProps {
  status: ApprovalStatus;
  className?: string;
  emphasized?: boolean;
}

export function ApprovalStatusBadge({ status, className, emphasized = false }: ApprovalStatusBadgeProps) {
  const t = useTranslations('orders.ApprovalStatus');

  return (
    <Badge
      variant={getApprovalStatusVariant(status)}
      size="status"
      className={cn(emphasized ? 'h-10 min-h-10 px-6 text-sm tracking-[1.5px] shadow-sm' : undefined, className)}
    >
      {t(status)}
    </Badge>
  );
}

export { getApprovalStatusVariant } from '@/lib/common/status-tag-variants';
