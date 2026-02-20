'use client';

import { Suspense, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useNotifications } from '@/hooks/notifications/useNotifications';
import { type AuthErrorKey, type NotificationOnboardingKey, dk } from '@/i18n/dynamic-key';
import { usePathname, useRouter } from '@/i18n/navigation';
import { l10n } from '@/lib/utils';
import type { CompanyOnboardingStatus } from '@/platform/services/model/company/company';
import type { StorefrontNotification } from '@/platform/services/model/notification/notification';
import { ToastType, notify } from '../ui/toast-notification';

/**
 * Special Component for the Welcome-Notification after Login and Error Notifications
 */
function WelcomeNotification() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const hasShownWelcome = useRef(false);
  const tLogin = useTranslations('auth.login');
  const tErrors = useTranslations('auth.errors');
  const t = useTranslations('common.Notification');

  useEffect(() => {
    // Only show welcome message once per mount
    if (hasShownWelcome.current) {
      return;
    }

    // Check if error parameter is present
    const errorParam = searchParams.get('error');
    if (errorParam) {
      const errorMessage = tErrors.has(dk<AuthErrorKey>(errorParam))
        ? tErrors(dk<AuthErrorKey>(errorParam))
        : tErrors('Default');

      notify({
        title: errorMessage,
        duration: 5000,
        type: ToastType.Error,
        button: {
          label: t('close'),
          onClick: () => {},
        },
      });

      // Mark as shown
      hasShownWelcome.current = true;
      router.push(pathname);
      return;
    }

    // Check if login parameter is present
    const loginParam = searchParams.get('login');
    if (!loginParam) {
      return;
    }

    // Check if user is authenticated
    if (!session?.user) {
      return;
    }

    // Show welcome notification
    const username = session.user.name || session.user.email || '';
    const titleMessage = tLogin('welcomeMessage', { username });

    notify({
      title: titleMessage,
      duration: 3000,
      type: ToastType.Success,
      button: {
        label: t('close'),
        onClick: () => {},
      },
    });

    // Mark as shown
    hasShownWelcome.current = true;
    router.push(pathname);
  }, [searchParams, session, t, pathname, router, tLogin, tErrors]);

  return null;
}

export function Notification() {
  const { registerNotificationListener, unregisterNotificationListener, markNotificationAsRead } = useNotifications();
  const t = useTranslations('common.Notification');
  const locale = useLocale();

  useEffect(() => {
    const notificationSubscription = registerNotificationListener(
      'COMPANY',
      (notification: string | StorefrontNotification<CompanyOnboardingStatus>) => {
        if (typeof notification !== 'string') {
          if (notification.code !== 'COMPANY_ONBOARDING') {
            return;
          }
          const status = notification.data_json?.status;
          const message =
            l10n(notification.message, locale) || t(dk<NotificationOnboardingKey>('company.onboarding.' + status));
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

          markNotificationAsRead(notification.id);
          notify({
            title: message,
            type: type,
            button: {
              label: t('close'),
              onClick: () => {},
            },
          });
        }
      },
    );
    return () => {
      unregisterNotificationListener(notificationSubscription);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Suspense fallback={<></>}>
      <WelcomeNotification />
    </Suspense>
  );
}
