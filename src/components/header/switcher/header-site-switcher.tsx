'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Globe } from 'lucide-react';
import TopBarSwitcher from '@/components/ui/molecules/ui-topbar-switcher';
import { Spinner } from '@/components/ui/spinner';
import { useSession } from '@/hooks/session/useSession';
import { useSite } from '@/hooks/site/useSite';
import { usePathname, useRouter } from '@/i18n/navigation';

export function SiteSwitcher() {
  const t = useTranslations('common.Regions');
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
    return <Spinner color="default" variant="sm" />;
  }

  if (!availableSites || !currentSite) {
    return <></>;
  }

  // If only one site is available, just show the site name without switcher
  if (availableSites.length === 1) {
    return (
      <div className="flex items-baseline gap-1.5 h-auto normal-case focus-none hover:cursor-pointer">
        <Globe className="flex self-center w-4 h-4" />
        <span className="flex self-baseline text-sm">{currentSite.name}</span>
      </div>
    );
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
