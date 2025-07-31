import { useTranslations } from 'next-intl';
import { ArrowRight, User } from 'lucide-react';
import useAuthDialog from '@/hooks/authentication/useAuthDialog';
import useAuthentication from '@/hooks/authentication/useAuthentication';
import { Link } from '@/i18n/navigation';
import { Button } from '../ui/button';

export function CartEmpty() {
  const t = useTranslations('cart');
  const { openDialog } = useAuthDialog();
  const { isAuthenticated } = useAuthentication();

  return (
    <div className="max-w-6xl mx-auto mt-8 mb-16">
      <div className="mx-4 xl:mx-9">
        <div className="flex flex-col sm:justify-center items-center gap-6">
          <h1 className="text-5xl lg:text-8xl font-bold text-headlines font-headlines">{t('cartEmpty')}</h1>
          <p className="text-xl">{isAuthenticated ? t('cartEmptyTextLoggedIn') : t('cartEmptyText')}</p>
          <div className="flex gap-2 sm:gap-6">
            {!isAuthenticated && (
              <Button onClick={() => openDialog('login')}>
                {t('cartEmptyLogin')}
                <User />
              </Button>
            )}
            <Link href="/browse">
              <Button variant="secondary">
                {t('cartEmptyLinkText')}
                <ArrowRight />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
