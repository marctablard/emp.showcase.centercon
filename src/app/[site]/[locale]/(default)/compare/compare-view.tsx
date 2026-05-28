'use client';

import { useTranslations } from 'next-intl';
import { X } from 'lucide-react';
import { ComparisonProductCard } from '@/components/comparison/comparison-product-card';
import { ComparisonTable } from '@/components/comparison/comparison-table';
import { Button } from '@/components/ui/button';
import { H4, H5 } from '@/components/ui/h';
import { Spinner } from '@/components/ui/spinner';
import { useComparison } from '@/hooks/comparison/useComparison';
import { useProducts } from '@/hooks/product/useProducts';
import { Link } from '@/i18n/navigation';

export function CompareView() {
  const t = useTranslations('comparison');
  const { productIds, count, removeProduct, clearComparison } = useComparison();
  const { products, loading } = useProducts(productIds, { prices: true });

  if (count === 0) {
    return (
      <div className="w-full max-w-[1848px] mx-auto px-9 py-12 text-center">
        <H4>{t('title')}</H4>
        <p className="mt-4 text-text-on-disabled">{t('emptyState')}</p>
        <Link
          href="/browse"
          className="mt-6 inline-block rounded-button bg-surface-action px-6 py-3 text-text-on-action font-bold hover:opacity-90 transition-opacity"
        >
          {t('emptyStateAction')}
        </Link>
      </div>
    );
  }

  if (loading && products.length === 0) {
    return (
      <div className="w-full max-w-[1848px] mx-auto px-9 py-12 flex justify-center">
        <Spinner variant="lg" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1848px] mx-auto px-9 py-8">
      {/* Sticky header bar */}
      <div className="sticky top-4 z-10 flex h-[72px] items-center justify-between rounded-2xl bg-white/95 px-12 shadow-lg backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <H4>{t('title')}</H4>
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-icon-primary-dark">
            {count}
          </span>
        </div>
        <Button
          size="icon"
          variant="link"
          className="h-8 w-8 text-text-headings normal-case"
          onClick={clearComparison}
          aria-label={t('clear')}
        >
          <X className="h-6 w-6" />
        </Button>
      </div>

      {/* Single product state */}
      {products.length === 1 && <p className="mt-6 text-text-on-disabled">{t('addMoreProducts')}</p>}

      {/* Products section */}
      <div className="border-t border-border-primary mt-6">
        <div className="py-6">
          <H5>{t('products')}</H5>
        </div>
        <div className="flex w-full">
          {/* Label column — matches table label column width */}
          <div className="w-[279px] shrink-0 flex items-start p-4">
            <span className="text-base font-bold text-text-body">{t('products')}</span>
          </div>
          {/* Product columns — flex-1 each, same as table */}
          {products.map((product) => (
            <ComparisonProductCard key={product.id} product={product} onRemove={removeProduct} />
          ))}
        </div>
      </div>

      {/* Comparison table */}
      {products.length >= 2 && <ComparisonTable products={products} />}
    </div>
  );
}
