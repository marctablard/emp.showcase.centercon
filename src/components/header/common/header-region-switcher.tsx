'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Globe } from 'lucide-react';
import TopBarSwitcher from '@/components/ui/molecules/ui-topbar-switcher';
import { useSession } from '@/hooks/session/useSession';
import { useSite } from '@/hooks/site/useSite';
import { l10n } from '@/lib/utils';
import { Spinner } from '../../ui/spinner';

export function RegionSwitcher() {
  const { session, loading: sessionLoading, setRegion } = useSession();
  const locale = useLocale();
  const t = useTranslations('Regions');
  const { regions, loading: siteLoading } = useSite();
  let initialRegion = undefined;
  if (session && regions) {
    initialRegion = regions.find((region) => region.code == session.region);
  }
  const [currentRegion, setCurrentRegion] = useState(initialRegion);

  const switchRegion = (region: string) => {
    setRegion(region);
  };

  useEffect(() => {
    if (regions) {
      let region;
      if (session) {
        region = regions.find((region) => region.code === session.region);
      }
      if (!region) {
        region = regions[0];
      }
      setCurrentRegion(region);
    }
  }, [session, regions]);

  if (siteLoading || sessionLoading) {
    return <Spinner color="white" variant="sm" />;
  }

  if (!regions || regions.length <= 1 || !currentRegion) {
    return <></>;
  }

  return (
    <TopBarSwitcher
      options={regions.map((region) => ({
        code: region.code,
        name: l10n(region.name, locale),
      }))}
      current={currentRegion.code}
      label={t('label')}
      onSelected={switchRegion}
      icon={<Globe className="w-4 h-4" />}
    />
  );
}
