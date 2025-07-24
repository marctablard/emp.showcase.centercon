'use client';

import { useTransition } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { Languages } from 'lucide-react';
import TopBarSwitcher from '@/components/ui/molecules/ui-topbar-switcher';
import { Spinner } from '@/components/ui/spinner';
import { usePathname, useRouter } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';

export function LanguageSwitcher() {
  const t = useTranslations('common.Languages');

  const currentLocale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const params = useParams();

  const switchLocale = (newLocale: string) => {
    startTransition(() => {
      if (newLocale === 'en') {
        // TODO: 'as-needed' seems to have issues working with the replacer method
        router.push('/en' + pathname, { locale: newLocale, scroll: false });
      } else {
        router.replace(
          // @ts-expect-error -- TypeScript will validate that only known `params`
          // are used in combination with a given `pathname`. Since the two will
          // always match for the current route, we can skip runtime checks.
          { pathname, params: { ...params, locale: newLocale } },
          { locale: newLocale, scroll: false },
        );
      }
    });
  };

  if (isPending) {
    return <Spinner color="white" variant="sm" />;
  }

  return (
    <TopBarSwitcher
      options={routing.locales.map((locale) => ({
        code: locale,
        name: t(locale),
      }))}
      icon={<Languages className="w-4 h-4" />}
      current={currentLocale}
      label={t('label')}
      onSelected={switchLocale}
    />
  );
}
