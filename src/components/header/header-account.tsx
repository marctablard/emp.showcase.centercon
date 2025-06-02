'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import useAuthentication from '@/hooks/authentication/useAuthentication';
import { Link } from '@/i18n/navigation';

export default function HeaderAccount() {
  const t = useTranslations('header');
  const { isAuthenticated, loading } = useAuthentication();
  if (loading) {
    return null;
  }
  return (
    <div>
      {isAuthenticated ? (
        <Button className="py-4" variant="outline">
          <Link href="/account">{t('account')}</Link>
        </Button>
      ) : (
        <Button className="py-4" variant="outline">
          <Link href="/login">{t('signIn')}</Link>
        </Button>
      )}
    </div>
  );
}
