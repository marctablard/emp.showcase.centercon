'use client';

import { useTranslations } from 'next-intl';
import { Instagram, Linkedin, Youtube } from 'lucide-react';

export default function Footer() {
  const t = useTranslations('footer');
  return (
    <footer className="bg-primary h-112 shadow-md">
      <div className="flex flex-col md:flex-row max-w-7xl mx-auto px-12 py-6 gap-6 text-white">
        <div className="flex gap-2">
          <Linkedin />
          <Youtube />
          <Instagram />
        </div>
        <div className="flex flex-col p-2 gap-2">
          <div className="text-xl">{t('companyName')}</div>
          <div>{t('street')}</div>
          <div>{t('additionalAddress')}</div>
          <div>{t('city')}</div>
        </div>
      </div>
    </footer>
  );
}
