'use client';

import React, { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { CreateTicketDialog } from '@/components/account/tickets/create-ticket-dialog';
import { useRouter } from '@/i18n/navigation';
import { fetchServiceTicketTypes } from '@/lib/client/servicetickets';
import { getLogger } from '@/lib/logger/use-logger-client';
import type { ServiceTicketType } from '@/platform/services/model/serviceticket';

/**
 * @deprecated Kept for backwards compatibility with the old dashboard dialog.
 */
export interface SupportTicketData {
  subject: string;
  message: string;
}

export interface SupportTicketDialogProps {
  /** @deprecated No longer used - ticket creation is handled by the platform. */
  onSubmit?: (data: SupportTicketData) => void;
}

/**
 * Dashboard entry point for creating a service ticket. Loads the available
 * request types and delegates to the shared {@link CreateTicketDialog}.
 */
export function SupportTicketDialog(_props: SupportTicketDialogProps) {
  const locale = useLocale();
  const router = useRouter();
  const [types, setTypes] = useState<ServiceTicketType[]>([]);

  useEffect(() => {
    let active = true;
    fetchServiceTicketTypes(locale)
      .then((fetched) => {
        if (active) {
          setTypes(fetched);
        }
      })
      .catch((error) => getLogger().error({ err: error }, 'Failed to load service ticket types'));
    return () => {
      active = false;
    };
  }, [locale]);

  return <CreateTicketDialog types={types} onCreated={(id) => router.push(`/account/tickets/${id}`)} />;
}

export default SupportTicketDialog;
