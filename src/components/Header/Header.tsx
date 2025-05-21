'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function Header() {
  const t = useTranslations('header');
  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="font-bold text-xl text-gray-800">
                Emporix Showcase
              </Link>
            </div>
            <div className="ml-6 flex items-center space-x-4">
              <Link 
                href="/product/10637590" 
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              >
                {t('featuredProduct')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
