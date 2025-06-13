import { useTranslations } from 'next-intl';
import { Euro, Globe, Languages } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Link } from '@/i18n/navigation';

export default function HeaderTopBanner() {
  const t = useTranslations('header');

  return (
    <div className="bg-primary text-white shadow-sm rounded-2xl flex items-center -mx-10 -mt-1 h-8 px-10">
      <div className="flex justify-between items-center self-stretch w-full">
        <div className="flex grow basis-0 shrink-0 items-center gap-4">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            <p className="text-sm">Germany</p>
          </div>
          <div className="h-6">
            <Separator orientation="vertical" decorative />
          </div>
          <div className="flex items-center gap-2">
            <Languages className="w-4 h-4" />
            <p className="text-sm">English</p>
          </div>
          <div className="h-6">
            <Separator orientation="vertical" decorative />
          </div>
          <div className="flex items-center gap-2">
            <Euro className="w-4 h-4" />
            <p className="text-sm">Euro</p>
          </div>
        </div>
        <div className="flex justify-center items-center">Here is space for you top banner announcements</div>
        <div className="flex grow basis-0 shrink-0 justify-end items-center gap-6">
          {/* Todo: Links are missing */}
          <Link href="/#">{t('blog')}</Link>
          <Link href="/#">{t('newsletter')}</Link>
          <Link href="/#">{t('offerRequest')}</Link>
          <Link href="/#">{t('contact')}</Link>
        </div>
      </div>
    </div>
  );
}
