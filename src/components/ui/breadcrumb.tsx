import * as React from 'react';
import { useTranslations } from 'next-intl';
import { ChevronLeftIcon, ChevronRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

function Breadcrumb({ ...props }: React.ComponentProps<'nav'>) {
  return (
    <nav
      aria-label="breadcrumb"
      data-slot="breadcrumb"
      className="relative [@media_screen]:after:content-[''] after:absolute after:top-0 after:right-0 after:w-8 after:h-full after:bg-gradient-to-r after:from-transparent after:to-white"
      {...props}
    />
  );
}

function BreadcrumbList({ className, ...props }: React.ComponentProps<'ol'>) {
  return (
    <ol
      data-slot="breadcrumb-list"
      className={cn(
        'text-sm lg:text-base text-foreground flex items-center gap-1 p-1 overflow-x-auto overflow-y-scroll max-w-[calc(100vw-2rem)] scroll-smooth hide-scrollbar',
        className,
      )}
      {...props}
    />
  );
}

function BreadcrumbItem({ className, ...props }: React.ComponentProps<'li'>) {
  return <li data-slot="breadcrumb-item" className={cn('inline-flex items-center gap-1', className)} {...props} />;
}

function BreadcrumbLink({ className, children, href, ...props }: React.ComponentProps<'a'>) {
  return (
    <Link
      href={href as string}
      data-slot="breadcrumb-link"
      className={cn(
        'inline-flex items-center gap-1 whitespace-nowrap text-primary [&>svg]:size-4 lg:[&>svg]:size-6 font-bold underline hover:text-primary-700 outline-none focus-visible:rounded-xs focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white',
        className,
      )}
      {...props}
    >
      {children}
      <ChevronRight />
    </Link>
  );
}

function BreadcrumbPage({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="breadcrumb-page"
      role="link"
      aria-disabled="true"
      aria-current="page"
      className={cn('whitespace-nowrap', className)}
      {...props}
    />
  );
}

function BreadcrumbBackLink({ className, href, ...props }: React.ComponentProps<'a'>) {
  const t = useTranslations('Breadcrumb');
  return (
    <Link
      href={href as string}
      data-slot="breadcrumb-back-link"
      aria-label={t('backLinkAriaLabel')}
      className={cn(
        'flex font-bold items-center justify-center gap-1 pr-4 underline cursor-pointer [&>svg]:size-4 lg:[&>svg]:size-6 hover:text-primary-700 outline-none focus-visible:rounded-xs focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white',
        className,
      )}
      {...props}
    >
      <ChevronLeftIcon className="size-4" />
      <span className="sr-only">{t('backLink')}</span>
      <span aria-hidden="true">{t('backLink')}</span>
    </Link>
  );
}

export { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbBackLink };
