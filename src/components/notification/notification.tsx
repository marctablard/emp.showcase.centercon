'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import useCompany from '@/hooks/company/useCompany';
import { usePolling } from '@/hooks/util/usePolling';
import { useNotificationStore } from '@/stores/notification-store';
import { ToastType, notify } from '../ui/toast-notification';

export function Notification() {
  const t = useTranslations('Notification');
  const { addNotification, hasNotification } = useNotificationStore();
  const { company, refresh: refreshCompany } = useCompany();
  const { start: startCompany, stop: stopCompany } = usePolling(() => {
    refreshCompany();
  }, 10000);

  useEffect(() => {
    if (company) {
      const status: 'approved' | 'pending' | 'rejected' = company.onboarding?.status || 'pending';
      const notificationKey = 'onboarding-' + company.id + '-' + status;
      if (status !== 'pending') {
        stopCompany();
      } else {
        startCompany();
      }
      if (!hasNotification(notificationKey)) {
        addNotification(notificationKey);
        const message = t('company.onboarding.' + status);
        let type = ToastType.Success;
        switch (status) {
          case 'rejected':
            type = ToastType.Error;
            break;
          case 'pending':
            type = ToastType.Warning;
            break;
          default:
          case 'approved':
            type = ToastType.Success;
            break;
        }
        notify({
          title: message,
          type: type,
          button: {
            label: t('close'),
            onClick: () => {},
          },
        });
      }
      return () => {
        stopCompany();
      };
    }
  }, [company, startCompany, stopCompany, addNotification, hasNotification, t]);

  return <></>;
}
