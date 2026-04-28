'use client';

import { forwardRef, useCallback, useImperativeHandle, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useToast } from '@/hooks/ui/useToast';
import { getLogger } from '@/lib/logger/use-logger-client';
import type { Product } from '@/platform/services/model/product';
import { parseTextInput } from './utils/parse-text-input';

export interface QuickOrderTextPasteHandle {
  addToList: () => Promise<void>;
  isResolving: boolean;
  hasText: boolean;
}

interface QuickOrderTextPasteProps {
  onAddProducts: (entries: Array<{ product: Product; quantity: number }>) => void;
  onResolvingChange?: (isResolving: boolean) => void;
  onTextChange?: (hasText: boolean) => void;
}

export const QuickOrderTextPaste = forwardRef<QuickOrderTextPasteHandle, QuickOrderTextPasteProps>(
  function QuickOrderTextPaste({ onAddProducts, onResolvingChange, onTextChange }, ref) {
    const t = useTranslations('quick-order');
    const locale = useLocale();
    const { toast } = useToast();
    const logger = getLogger();

    const [text, setText] = useState('');
    const [isResolving, setIsResolving] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // We need a direct fetch for resolving codes, since useSearch's getSuggestions
    // stores results in shared state. Use a standalone fetch to avoid conflicts.
    const resolveProductByCode = useCallback(
      async (code: string): Promise<Product | null> => {
        try {
          const url = new URL('/api/search/suggestions', window.location.origin);
          url.searchParams.append('query', code);
          url.searchParams.append('locale', locale);
          // Site and currency are handled by the API route via session
          const response = await fetch(url.toString());
          if (!response.ok) {
            return null;
          }
          const data = await response.json();
          const products: Product[] = data.products ?? [];
          // Find exact match by code/sku or take the first result
          return (
            products.find(
              (p) => p.sku?.toLowerCase() === code.toLowerCase() || p.id?.toLowerCase() === code.toLowerCase(),
            ) ??
            products[0] ??
            null
          );
        } catch (err) {
          logger.error({ err, code }, 'Failed to resolve product code');
          return null;
        }
      },
      [locale, logger],
    );

    const handleAddToList = useCallback(async () => {
      const entries = parseTextInput(text);
      if (entries.length === 0) {
        return;
      }

      setIsResolving(true);
      onResolvingChange?.(true);
      try {
        const resolved: Array<{ product: Product; quantity: number }> = [];
        const notFound: string[] = [];

        for (const entry of entries) {
          const product = await resolveProductByCode(entry.code);
          if (product) {
            resolved.push({ product, quantity: entry.quantity });
          } else {
            notFound.push(entry.code);
          }
        }

        if (resolved.length > 0) {
          onAddProducts(resolved);
          toast({
            title: t('notifications.productsAdded', { count: resolved.length }),
            variant: 'success',
          });
        }

        if (notFound.length > 0) {
          toast({
            title: t('notifications.productsNotFound', { count: notFound.length }),
            description: notFound.join(', '),
            variant: 'destructive',
          });
        }

        if (resolved.length > 0) {
          setText('');
          onTextChange?.(false);
        }
      } catch (err) {
        logger.error({ err }, 'Failed to process text paste input');
        toast({
          title: t('validation.invalidFormat'),
          variant: 'destructive',
        });
      } finally {
        setIsResolving(false);
        onResolvingChange?.(false);
      }
    }, [text, resolveProductByCode, onAddProducts, toast, t, logger, onResolvingChange, onTextChange]);

    useImperativeHandle(
      ref,
      () => ({
        addToList: handleAddToList,
        isResolving,
        hasText: text.trim().length > 0,
      }),
      [handleAddToList, isResolving, text],
    );

    return (
      <div className="flex-1 flex flex-col gap-4">
        <div>
          <label className="font-bold text-base mb-1 block">{t('textPaste.label')}</label>
          <p className="text-[12px] leading-5 text-text-disabled mb-2">{t('textPaste.hint')}</p>
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              onTextChange?.(e.target.value.trim().length > 0);
            }}
            placeholder={t('textPaste.placeholder')}
            className="text-text-body flex w-full min-w-0 px-3 border border-border-primary rounded-sm text-base placeholder:text-base placeholder:text-text-placeholders p-3 transition-all hover:border-border-action-hover hover:bg-surface-page focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus disabled:cursor-not-allowed disabled:bg-surface-disabled disabled:text-text-on-disabled disabled:border-border-disabled resize-y"
            rows={5}
            style={{ minHeight: '140px' }}
            disabled={isResolving}
            aria-label={t('textPaste.description')}
            data-testid="quick-order-text-paste-input"
          />
        </div>
      </div>
    );
  },
);
