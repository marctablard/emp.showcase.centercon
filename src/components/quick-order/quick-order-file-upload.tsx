'use client';

import { useCallback, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { FileDown, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useToast } from '@/hooks/ui/useToast';
import { getLogger } from '@/lib/logger/use-logger-client';
import type { Product } from '@/platform/services/model/product';
import { EmptyFileError, FileTooLargeError, UnsupportedFormatError, parseUploadedFile } from './utils/parse-file';

interface QuickOrderFileUploadProps {
  onAddProducts: (entries: Array<{ product: Product; quantity: number }>) => void;
}

export function QuickOrderFileUpload({ onAddProducts }: QuickOrderFileUploadProps) {
  const t = useTranslations('quick-order');
  const locale = useLocale();
  const { toast } = useToast();
  const logger = getLogger();

  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resolveProductByCode = useCallback(
    async (code: string): Promise<Product | null> => {
      try {
        const url = new URL('/api/search/suggestions', window.location.origin);
        url.searchParams.append('query', code);
        url.searchParams.append('locale', locale);
        const response = await fetch(url.toString());
        if (!response.ok) {
          return null;
        }
        const data = await response.json();
        const products: Product[] = data.products ?? [];
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

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) {
        return;
      }

      setIsProcessing(true);
      setSelectedFile(file);

      try {
        const entries = await parseUploadedFile(file);

        const resolved: Array<{ product: Product; quantity: number }> = [];
        const notFoundCodes: string[] = [];

        for (const entry of entries) {
          const product = await resolveProductByCode(entry.code);
          if (product) {
            resolved.push({ product, quantity: entry.quantity });
          } else {
            notFoundCodes.push(entry.code);
          }
        }

        if (resolved.length > 0) {
          onAddProducts(resolved);
        }

        if (notFoundCodes.length === 0 && resolved.length > 0) {
          toast({
            title: t('notifications.uploadSuccess', { count: resolved.length }),
            variant: 'success',
          });
        } else if (resolved.length > 0 && notFoundCodes.length > 0) {
          toast({
            title: t('notifications.uploadPartial', {
              found: resolved.length,
              total: entries.length,
              notFound: notFoundCodes.length,
            }),
            description: notFoundCodes.join(', '),
            variant: 'destructive',
          });
        } else if (resolved.length === 0) {
          toast({
            title: t('notifications.productsNotFound', { count: notFoundCodes.length }),
            description: notFoundCodes.join(', '),
            variant: 'destructive',
          });
        }
      } catch (err) {
        if (err instanceof FileTooLargeError) {
          toast({
            title: t('validation.fileTooLarge'),
            variant: 'destructive',
          });
        } else if (err instanceof EmptyFileError) {
          toast({
            title: t('validation.emptyFile'),
            variant: 'destructive',
          });
        } else if (err instanceof UnsupportedFormatError) {
          toast({
            title: t('validation.unsupportedFormat'),
            variant: 'destructive',
          });
        } else {
          logger.error({ err }, 'Failed to parse uploaded file');
          toast({
            title: t('notifications.uploadError'),
            variant: 'destructive',
          });
        }
        setSelectedFile(null);
      } finally {
        setIsProcessing(false);
        // Reset input so the same file can be re-selected
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    },
    [resolveProductByCode, onAddProducts, toast, t, logger],
  );

  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleRemoveFile = useCallback(() => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  return (
    <div className="rounded-sm bg-surface-page shadow-sm p-6 flex flex-col gap-4" data-testid="quick-order-file-upload">
      <h5 className="text-xl font-bold leading-6 text-text-headings">{t('fileUpload.title')}</h5>

      <div className="flex flex-col gap-4">
        <p className="text-base leading-6 text-text-body">{t('fileUpload.description')}</p>

        <a
          href="/templates/quick-order-template.csv"
          download="quick-order-template.csv"
          className="inline-flex items-center gap-1 text-base font-bold leading-6 text-text-action underline hover:text-text-action-hover w-fit"
          data-testid="quick-order-download-template"
        >
          {t('fileUpload.downloadTemplate')}
          <FileDown className="size-6 shrink-0" />
        </a>

        <div className="flex items-center gap-6 flex-wrap">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx"
            onChange={handleFileChange}
            className="hidden"
            aria-label={t('fileUpload.selectFile')}
            data-testid="quick-order-file-input"
          />

          <Button
            onClick={handleUploadClick}
            disabled={isProcessing}
            className="w-full sm:w-auto sm:min-w-[144px] h-12"
            data-testid="quick-order-upload-button"
          >
            {isProcessing ? (
              <>
                <Spinner variant="sm" color="white" />
                <span className="ml-2">{t('fileUpload.uploadButton')}</span>
              </>
            ) : (
              <>
                {t('fileUpload.uploadButton')}
                <Upload className="size-6 shrink-0" />
              </>
            )}
          </Button>

          {selectedFile && !isProcessing && (
            <div
              className="inline-flex items-center gap-2 rounded-sm border border-border-primary bg-surface-page px-2 py-1 h-8"
              data-testid="quick-order-active-file"
            >
              <span className="text-sm leading-6 text-text-body truncate max-w-[120px]">{selectedFile.name}</span>
              <button
                type="button"
                onClick={handleRemoveFile}
                className="shrink-0 text-text-body hover:text-text-headings cursor-pointer"
                aria-label={t('fileUpload.removeFile')}
                data-testid="quick-order-remove-file"
              >
                <X className="size-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
