'use client';

import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';

// Define QuoteStatus enum directly here to avoid import issues
export enum QuoteStatus {
  REQUESTED = 'REQUESTED',
  AVAILABLE = 'AVAILABLE',
  CHANGE_REQUESTED = 'CHANGE_REQUESTED',
  REJECTED = 'REJECTED',
  ACCEPTED = 'ACCEPTED',
  ORDER_CREATED = 'ORDER_CREATED',
  CLOSED = 'CLOSED',
}

interface QuoteStatusBadgeProps {
  status: QuoteStatus;
}

/**
 * Badge component for displaying quote status with appropriate styling
 */
export function QuoteStatusBadge({ status }: QuoteStatusBadgeProps) {
  const t = useTranslations('account.quoteStatus');

  // Get the appropriate status badge variant similar to order badges
  const getStatusVariant = (status: QuoteStatus) => {
    switch (status) {
      case QuoteStatus.REQUESTED:
        return { variant: 'outline' as const };
      case QuoteStatus.AVAILABLE:
        return { variant: 'secondary' as const };
      case QuoteStatus.CHANGE_REQUESTED:
        return { variant: 'warning' as const };
      case QuoteStatus.REJECTED:
        return { variant: 'destructive' as const };
      case QuoteStatus.ACCEPTED:
        return { variant: 'success' as const };
      case QuoteStatus.ORDER_CREATED:
        return { variant: 'success' as const };
      case QuoteStatus.CLOSED:
        return { variant: 'outline' as const };
      default:
        return { variant: 'outline' as const };
    }
  };

  return (
    <Badge variant={getStatusVariant(status).variant} className="uppercase">
      {t(status.toLowerCase())}
    </Badge>
  );
}
