import { getTranslations } from 'next-intl/server';
import { Product } from '@/platform/services/model/product';
import { l10n } from './utils';

export interface BreadcrumbConent {
  href: string;
  label: string;
}

export async function generateBreadcrumbForProduct(product: Product, locale: string): Promise<BreadcrumbConent[]> {
  const t = await getTranslations('Home');
  return [
    {
      href: `/product/${product.id}`,
      label: l10n(product.name, locale),
    },
  ];
}
