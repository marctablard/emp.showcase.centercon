'use client';

import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import type { QuoteStatusKey } from '@/i18n/dynamic-key';
import { QUOTE_STATUS_TO_MESSAGE_KEY } from '@/lib/common/quote-status-message-keys';
import { getQuoteStatusVariant } from '@/lib/common/status-tag-variants';
import type { QuoteStatus } from '@/platform/services/model/quote';

interface QuoteStatusBadgeProps {
  status: QuoteStatus;
  emphasized?: boolean;
}

/**
 * Quote status tag — aligned with Figma Molecules / Tags.
 */
export function QuoteStatusBadge({ status, emphasized = false }: QuoteStatusBadgeProps) {
  const t = useTranslations('account.quoteStatus');

  return (
    <Badge
      variant={getQuoteStatusVariant(status)}
      size="status"
      className={emphasized ? 'h-10 min-h-10 px-6 text-sm tracking-[1.5px] shadow-sm' : undefined}
    >
      {t(QUOTE_STATUS_TO_MESSAGE_KEY[status] as QuoteStatusKey)}
    </Badge>
  );
}

export { getQuoteStatusVariant } from '@/lib/common/status-tag-variants';
