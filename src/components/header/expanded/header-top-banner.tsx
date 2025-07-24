import { useTranslations } from 'next-intl';
import TopBannerAnnouncement from '@/components/cms/top-banner-announcement';
import { LanguageSwitcher } from '@/components/header/common/header-language-switcher';
import { Separator } from '@/components/ui/separator';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { Link } from '@/i18n/navigation';
import { CurrencySwitcher } from '../common/header-currency-switcher';
import { RegionSwitcher } from '../common/header-region-switcher';

export function HeaderTopBanner() {
  const t = useTranslations('header');
  const isExtraLargeScreen = useBreakpoint('xl');

  return (
    <div className="bg-primary text-white shadow-sm rounded-2xl flex items-center -mx-2 lg:-mx-4 -mt-1 h-8 px-8 lg:px-10">
      <div className="flex justify-between items-center self-stretch w-full">
        <div className="flex grow basis-0 shrink-0 items-center gap-2">
          <RegionSwitcher />
          <div className="h-6">
            <Separator orientation="vertical" decorative />
          </div>
          <LanguageSwitcher />
          <div className="h-6">
            <Separator orientation="vertical" decorative />
          </div>
          <CurrencySwitcher />
        </div>
        {isExtraLargeScreen && (
          <div className="justify-center items-center font-bold">
            <TopBannerAnnouncement />
          </div>
        )}
        <div className="flex grow basis-0 shrink-0 justify-end items-center gap-6 text-nowrap">
          <Link title={t('blog')} href="/blog">
            {t('blog')}
          </Link>
          <Link title={t('newsletter')} href="/newsletter">
            {t('newsletter')}
          </Link>
          <Link title={t('offerRequest')} href="/offer-request">
            {t('offerRequest')}
          </Link>
          <Link title={t('contact')} href="/contact">
            {t('contact')}
          </Link>
        </div>
      </div>
    </div>
  );
}
