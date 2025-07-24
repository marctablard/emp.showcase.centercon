'use client';

import { useMemo, useTransition } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { Languages } from 'lucide-react';
import TopBarSwitcher from '@/components/ui/molecules/ui-topbar-switcher';
import { Spinner } from '@/components/ui/spinner';
import { useSite } from '@/hooks/site/useSite';
import { usePathname, useRouter } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';

export function LanguageSwitcher() {
  const t = useTranslations('common.Languages');

  const currentLocale = useLocale();
  const { site, loading: siteLoading } = useSite();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const params = useParams();

  // Memoize the language options to avoid recreating objects on each render
  const languageOptions = useMemo(() => {
    let availableLanguages;
    if (site?.languages && Array.isArray(site.languages) && site.languages.length > 0) {
      availableLanguages = routing.locales.filter((locale) =>
        site.languages.some((lang) => lang.toLowerCase() === locale.toLowerCase()),
      );
    } else {
      availableLanguages = routing.locales;
    }
    return availableLanguages.map((locale) => ({
      code: locale,
      name: t(locale),
    }));
  }, [site?.languages, t]);

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

  if (isPending || siteLoading) {
    return <Spinner color="white" variant="sm" />;
  }

  return (
    <TopBarSwitcher
      options={languageOptions}
      icon={<Languages className="w-4 h-4" />}
      current={currentLocale}
      label={t('label')}
      onSelected={switchLocale}
    />
  );
}
