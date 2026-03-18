import { useTranslations } from 'next-intl';
import { H2 } from '@/components/ui/h';

export function SearchNoResults() {
  const t = useTranslations('search');

  return (
    <div className="py-12 text-center">
      <H2 className="mb-2">{t('searchResults.noProductsFound')}</H2>
      <p className="text-text-placeholders">{t('searchResults.tryAdjusting')}</p>
    </div>
  );
}
