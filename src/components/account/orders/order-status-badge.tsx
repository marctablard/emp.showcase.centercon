'use client';

import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { type OrderStatusLowercaseKey, dk } from '@/i18n/dynamic-key';
import { getOrderStatusVariant } from '@/lib/common/status-tag-variants';
import type { Order } from '@/platform/services/model/order/order';

/**
 * Order status tag — Figma Molecules / Tags; list and detail must stay aligned.
 */
export function OrderStatusBadge({ status, emphasized = false }: { status: Order['status']; emphasized?: boolean }) {
  const t = useTranslations('orders');

  return (
    <Badge
      variant={getOrderStatusVariant(status)}
      size="status"
      className={emphasized ? 'h-10 min-h-10 px-6 text-sm tracking-[1.5px] shadow-sm' : undefined}
    >
      {t(dk<OrderStatusLowercaseKey>(`status.${status.toLowerCase()}`))}
    </Badge>
  );
}

export { getOrderStatusVariant } from '@/lib/common/status-tag-variants';
