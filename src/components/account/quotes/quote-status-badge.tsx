'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

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
  const getStatusColor = (status: QuoteStatus): string => {
    switch (status) {
      case QuoteStatus.REQUESTED:
        return 'bg-neutral-100 text-neutral-900 border-neutral-300';
      case QuoteStatus.AVAILABLE:
        return 'bg-blue-100 text-blue-900 border-blue-300';
      case QuoteStatus.CHANGE_REQUESTED:
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case QuoteStatus.REJECTED:
        return 'bg-danger-100 text-danger-900 border-danger-300';
      case QuoteStatus.ACCEPTED:
        return 'bg-success-100 text-success-900 border-success-300';
      case QuoteStatus.ORDER_CREATED:
        return 'bg-green-100 text-green-900 border-green-300';
      case QuoteStatus.CLOSED:
        return 'bg-neutral-100 text-neutral-900 border-neutral-300';
      default:
        return 'bg-neutral-100 text-neutral-900 border-neutral-300';
    }
  };

  return (
    <Badge
      className={cn('px-2 py-1 uppercase text-xs font-semibold rounded-sm whitespace-nowrap', getStatusColor(status))}
    >
      {status}
    </Badge>
  );
}
