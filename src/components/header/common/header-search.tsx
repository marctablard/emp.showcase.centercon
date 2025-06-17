import { useTranslations } from 'next-intl';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface HeaderSearchProps {
  small: boolean;
}

export default function HeaderSearch({ small }: HeaderSearchProps) {
  const t = useTranslations('header');

  return (
    <div className={`hidden lg:block w-full relative ${small ? 'max-w-[320px]' : 'max-w-[720px]'}`}>
      <Input
        placeholder={small ? t('shortSearch') : t('search')}
        className="h-[44px] pr-[62px] text-neutral-600 bg-neutral-100 hover:bg-neutral-100 border border-neutral-100 hover:border-primary-700"
      />
      <div className="absolute right-6 top-1/2 -translate-y-1/2 bg-transparent p-2 cursor-pointer">
        <Search className="text-primary-600" width="28" height="28" />
      </div>
    </div>
  );
}
