'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Globe } from 'lucide-react';
import TopBarSwitcher from '@/components/ui/molecules/ui-topbar-switcher';
import { useSession } from '@/hooks/session/useSession';
import { useSite } from '@/hooks/site/useSite';
import { usePathname, useRouter } from '@/i18n/navigation';
import { Spinner } from '../../ui/spinner';

export function SiteSwitcher() {
  const t = useTranslations('Regions');
  const { setSite } = useSession();
  const { site, availableSites, loading: siteLoading } = useSite();
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const [currentSite] = useState(site);

  const switchSite = (site: string) => {
    setSite(site).then((success) => {
      if (success) {
        const newSite = availableSites?.find((s) => s.code === site);
        if (newSite?.languages.includes(locale)) {
          // refresh page, because content might change
          location.reload();
        } else {
          router.push('/' + newSite?.defaultLanguage + pathname, { locale: newSite?.defaultLanguage, scroll: false });
        }
      }
    });
  };

  if (siteLoading) {
    return <Spinner color="white" variant="sm" />;
  }

  if (!availableSites || availableSites.length <= 1 || !currentSite) {
    return <></>;
  }

  return (
    <TopBarSwitcher
      options={availableSites.map((site) => ({
        code: site.code,
        name: site.name,
      }))}
      current={currentSite.code}
      label={t('label')}
      onSelected={switchSite}
      icon={<Globe className="w-4 h-4" />}
    />
  );
}
