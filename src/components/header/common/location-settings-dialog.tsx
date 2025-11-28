'use client';

import { useTranslations } from 'next-intl';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { CurrencySwitcher } from './header-currency-switcher';
import { LanguageSwitcher } from './header-language-switcher';
import { SiteSwitcher } from './header-site-switcher';

interface LocationSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LocationSettingsDialog({ open, onOpenChange }: LocationSettingsDialogProps) {
  const t = useTranslations('layout.header');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('locationSettings')}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-6 py-4">
          <div className="flex flex-col gap-3">
            <label className="text-base font-medium text-text-secondary">{t('site')}</label>
            <SiteSwitcher />
          </div>

          <Separator />

          <div className="flex flex-col gap-3">
            <label className="text-base font-medium text-text-secondary">{t('language')}</label>
            <LanguageSwitcher />
          </div>

          <Separator />

          <div className="flex flex-col gap-3">
            <label className="text-base font-medium text-text-secondary">{t('currency')}</label>
            <CurrencySwitcher />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
