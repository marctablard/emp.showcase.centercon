'use client';

import { useMemo, useTransition } from 'react';
import { useLocale, useTranslations } from 'next-intl';
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

  // Get the current search parameters to preserve them when switching languages
  const searchParams =
    typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();

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
  }, [site, t]);

  const switchLocale = (newLocale: string) => {
    startTransition(() => {
      const searchParamsString = searchParams.toString();
      const queryString = searchParamsString ? `?${searchParamsString}` : '';

      if (newLocale === 'en') {
        // TODO: 'as-needed' seems to have issues working with the replacer method
        router.push(`/en${pathname}${queryString}`, { locale: newLocale, scroll: false });
      } else {
        const url = new URL(window.location.origin);
        url.pathname = pathname.replace(`/${currentLocale}`, `/${newLocale}`);
        url.search = queryString;

        router.push(url.pathname + url.search, { locale: newLocale, scroll: false });
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
