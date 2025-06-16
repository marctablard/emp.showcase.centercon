'use client';

import { useTransition } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { Languages } from 'lucide-react';
import { routing } from '@/app/i18n/routing';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { usePathname, useRouter } from '@/i18n/navigation';
import { Spinner } from './ui/spinner';

export function LanguageSwitcher() {
  const t = useTranslations('Languages');

  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const params = useParams();

  const switchLocale = (newLocale: string) => {
    startTransition(() => {
      router.replace(
        // @ts-expect-error -- TypeScript will validate that only known `params`
        // are used in combination with a given `pathname`. Since the two will
        // always match for the current route, we can skip runtime checks.
        { pathname, params: { ...params, locale: newLocale } },
        { locale: newLocale },
      );
    });
  };

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 h-auto p-0 normal-case p-1 focus-none">
          {isPending ? <Spinner color="white" variant="sm" /> : <Languages className="w-4 h-4" />}
          <span className="text-sm pt-0.5">{t(locale)}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {routing.locales.map((locale) => (
          <DropdownMenuItem
            key={locale}
            onClick={() => switchLocale(locale)}
            className={locale === locale ? 'bg-muted' : ''}
          >
            {t(locale)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
