import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { ArrowRight, User } from 'lucide-react';
import { Button } from '../ui/button';

export function CartEmpty() {
  const t = useTranslations('cart');

  return (
    <div className="max-w-6xl mx-auto mt-6 mb-16">
      <div className="mx-4 xl:mx-9">
        <div className="flex flex-col sm:justify-center items-center gap-6">
          <h1 className="text-5xl lg:text-8xl font-bold text-headlines font-headlines">{t('cartEmpty')}</h1>
          <p className="text-xl">{t('cartEmptyText')}</p>
          <div className="flex gap-2 sm:gap-6">
            <Link href="/login">
              <Button>
                {t('cartEmptyLogin')}
                <User />
              </Button>
            </Link>
            <Link href="/">
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
