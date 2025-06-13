import { getTranslations } from 'next-intl/server';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default async function HeaderSearch() {
  const t = await getTranslations('header');

  return (
    <div className="w-full max-w-[700px] relative">
      <Input placeholder={t('search')} className="pr-[62px]" />
      <div className="absolute right-6 top-1/2 -translate-y-1/2 bg-transparent p-2 cursor-pointer">
        <Search className="text-primary-600" width="28" height="28" />
      </div>
    </div>
  );
}
