'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { DynamicIcon, IconName } from 'lucide-react/dynamic';
import TopBarSwitcher from '@/components/ui/molecules/ui-topbar-switcher';
import { useSession } from '@/hooks/session/useSession';
import { useSite } from '@/hooks/site/useSite';
import { l10n } from '@/lib/utils';
import { Spinner } from '../../ui/spinner';

export function CurrencySwitcher() {
  const { session, loading: sessionLoading, setCurrency } = useSession();
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations('common.Currencies');
  const { currencies, loading: siteLoading } = useSite();
  let initialCurrency = undefined;
  if (session && currencies) {
    initialCurrency = currencies.find((currencies) => currencies.code == session.currency);
  }
  const [currentCurrency, setCurrentCurrency] = useState(initialCurrency);

  const switchCurrency = (currency: string) => {
    setCurrency(currency);
  };

  useEffect(() => {
    if (session?.currency != currentCurrency?.code) {
      // refresh page, because much will change due to changed currency
      router.refresh();
    }
  }, [session, currentCurrency, router]);

  useEffect(() => {
    if (currencies) {
      let currency;
      if (session) {
        currency = currencies.find((currency) => currency.code === session.currency);
      }
      if (!currency) {
        currency = currencies[0];
      }
      setCurrentCurrency(currency);
    }
  }, [session, currencies]);

  if (siteLoading || sessionLoading) {
    return <Spinner color="white" variant="sm" />;
  }

  if (!currencies || currencies.length <= 1 || !currentCurrency) {
    return <></>;
  }

  function getIconName(): IconName {
    switch (currentCurrency?.code) {
      case 'EUR':
        return 'euro';
      case 'GBP':
        return 'pound-sterling';
      case 'USD':
        return 'dollar-sign';
      case 'YEN':
        return 'japanese-yen';
      case 'RS':
        return 'indian-rupee';
      default:
        return 'coins';
    }
  }
  const icon = <DynamicIcon name={getIconName()} color="white" className="w-4 h-4" />;

  return (
    <TopBarSwitcher
      options={currencies.map((currency) => ({
        code: currency.id,
        name: l10n(currency.name || currency.id, locale),
      }))}
      current={currentCurrency.id}
      label={t('label')}
      onSelected={switchCurrency}
      icon={icon}
    />
  );
}
