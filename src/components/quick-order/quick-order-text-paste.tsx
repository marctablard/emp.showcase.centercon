'use client';

import { forwardRef, useCallback, useImperativeHandle, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useToast } from '@/hooks/ui/useToast';
import { fetchProductAvailability } from '@/lib/client/availability';
import { fetchProductPrices } from '@/lib/client/prices';
import { getLogger } from '@/lib/logger/use-logger-client';
import type { Product } from '@/platform/services/model/product';
import { parseTextInput } from './utils/parse-text-input';
import { resolveProductsBatch } from './utils/resolve-product';

export interface QuickOrderTextPasteHandle {
  addToList: () => Promise<void>;
  isResolving: boolean;
  hasText: boolean;
  hasValidationErrors: boolean;
}

interface QuickOrderTextPasteProps {
  onAddProducts: (entries: Array<{ product: Product; quantity: number }>) => void;
  onResolvingChange?: (isResolving: boolean) => void;
  onTextChange?: (hasText: boolean) => void;
  onValidationChange?: (hasErrors: boolean) => void;
}

export const QuickOrderTextPaste = forwardRef<QuickOrderTextPasteHandle, QuickOrderTextPasteProps>(
  function QuickOrderTextPaste({ onAddProducts, onResolvingChange, onTextChange, onValidationChange }, ref) {
    const t = useTranslations('quick-order');
    const locale = useLocale();
    const { toast } = useToast();
    const logger = getLogger();

    const [text, setText] = useState('');
    const [isResolving, setIsResolving] = useState(false);
    const [validationErrors, setValidationErrors] = useState<string[]>([]);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleAddToList = useCallback(async () => {
      const { entries, errors } = parseTextInput(text);
      if (errors.length > 0) {
        return;
      }
      if (entries.length === 0) {
        return;
      }

      setIsResolving(true);
      onResolvingChange?.(true);
      try {
        const { resolved, notFound: notFoundEntries } = await resolveProductsBatch(entries, locale, logger);

        // Check prices for resolved products
        const withPrice: Array<{ product: Product; quantity: number }> = [];
        const noPriceEntries: Array<{ code: string; quantity: number }> = [];

        if (resolved.length > 0) {
          const ids = resolved.map((r) => r.product.id);
          try {
            const priceMap = await fetchProductPrices(ids);
            for (const r of resolved) {
              const price = priceMap[r.product.id];
              if (price) {
                withPrice.push({ product: { ...r.product, price }, quantity: r.quantity });
              } else {
                noPriceEntries.push({ code: r.code, quantity: r.quantity });
              }
            }
          } catch {
            // If batch price fetch fails, treat all as no-price
            for (const r of resolved) {
              noPriceEntries.push({ code: r.code, quantity: r.quantity });
            }
          }
        }

        if (withPrice.length > 0) {
          // Check availability for products with prices
          const availableProducts: Array<{ product: Product; quantity: number }> = [];
          const insufficientStockEntries: Array<{
            code: string;
            requestedQty: number;
            availableQty: number;
          }> = [];

          const availabilityResults = await Promise.all(
            withPrice.map(async (entry) => {
              try {
                const availability = await fetchProductAvailability(entry.product.id);
                return { entry, availability };
              } catch {
                // If availability check fails, allow the product through
                return { entry, availability: null };
              }
            }),
          );

          for (const { entry, availability } of availabilityResults) {
            const code =
              resolved.find((r) => r.product.id === entry.product.id)?.code ?? entry.product.sku ?? entry.product.id;

            if (!availability || !availability.isAvailable || availability.availableQuantity <= 0) {
              insufficientStockEntries.push({
                code,
                requestedQty: entry.quantity,
                availableQty: 0,
              });
            } else if (availability.availableQuantity < entry.quantity) {
              availableProducts.push({ product: entry.product, quantity: availability.availableQuantity });
              insufficientStockEntries.push({
                code,
                requestedQty: entry.quantity,
                availableQty: availability.availableQuantity,
              });
            } else {
              availableProducts.push(entry);
            }
          }

          if (availableProducts.length > 0) {
            onAddProducts(availableProducts);
            toast({
              title: t('notifications.productsAdded', { count: availableProducts.length }),
              variant: 'success',
            });
          }

          if (insufficientStockEntries.length > 0) {
            for (const stock of insufficientStockEntries) {
              toast({
                title: t('notifications.insufficientStock', {
                  code: stock.code,
                  requested: stock.requestedQty,
                  available: stock.availableQty,
                }),
                variant: 'warning',
              });
            }

            // Add zero-stock entries to failed list so they stay in textarea
            const zeroStockCodes = insufficientStockEntries.filter((s) => s.availableQty <= 0).map((s) => s.code);
            const zeroStockFailed = entries.filter((e) =>
              zeroStockCodes.some((c) => c.toLowerCase() === e.code.toLowerCase()),
            );
            noPriceEntries.push(...zeroStockFailed);
          }
        }

        const failedEntries = [...notFoundEntries, ...noPriceEntries];
        if (failedEntries.length > 0) {
          toast({
            title: t('notifications.productsCouldNotBeAdded', { count: failedEntries.length }),
            description: failedEntries.map((e) => e.code).join(', '),
            variant: 'destructive',
            persistent: true,
          });
        }
        if (failedEntries.length > 0) {
          const remaining = failedEntries
            .map((e) => (e.quantity === 1 ? e.code : `${e.code}, ${e.quantity}`))
            .join('\n');
          setText(remaining);
          onTextChange?.(true);
        } else {
          setText('');
          onTextChange?.(false);
        }
      } catch (err) {
        logger.error({ err }, 'Failed to process text paste input');
        toast({
          title: t('validation.invalidFormat'),
          variant: 'destructive',
          persistent: true,
        });
      } finally {
        setIsResolving(false);
        onResolvingChange?.(false);
      }
    }, [text, locale, onAddProducts, toast, t, logger, onResolvingChange, onTextChange]);

    useImperativeHandle(
      ref,
      () => ({
        addToList: handleAddToList,
        isResolving,
        hasText: text.trim().length > 0,
        hasValidationErrors: validationErrors.length > 0,
      }),
      [handleAddToList, isResolving, text, validationErrors],
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
              const value = e.target.value;
              setText(value);
              onTextChange?.(value.trim().length > 0);
              const { errors } = parseTextInput(value);
              setValidationErrors(errors);
              onValidationChange?.(errors.length > 0);
            }}
            placeholder={t('textPaste.placeholder')}
            className="text-text-body flex w-full min-w-0 px-3 border border-border-primary rounded-sm text-base placeholder:text-base placeholder:text-text-placeholders p-3 transition-all hover:border-border-action-hover hover:bg-surface-page focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus disabled:cursor-not-allowed disabled:bg-surface-disabled disabled:text-text-on-disabled disabled:border-border-disabled resize-y"
            rows={5}
            style={{ minHeight: '140px' }}
            disabled={isResolving}
            aria-label={t('textPaste.description')}
            aria-invalid={validationErrors.length > 0}
            data-testid="quick-order-text-paste-input"
          />
          {validationErrors.length > 0 && (
            <div className="mt-2 text-sm text-destructive" role="alert" data-testid="quick-order-text-paste-errors">
              {validationErrors.map((line) => (
                <p key={line}>{t('validation.invalidQuantity', { line })}</p>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  },
);
