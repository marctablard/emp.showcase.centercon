import * as React from 'react';
import { useTranslations } from 'next-intl';
import { ChevronLeftIcon, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

function Breadcrumb({ ...props }: React.ComponentProps<'nav'>) {
  return <nav aria-label="breadcrumb" data-slot="breadcrumb" {...props} />;
}

function BreadcrumbList({ className, ...props }: React.ComponentProps<'ol'>) {
  return (
    <ol
      data-slot="breadcrumb-list"
      className={cn('text-sm lg:text-base text-foreground flex flex-wrap items-center gap-1 break-words', className)}
      {...props}
    />
  );
}

function BreadcrumbItem({ className, ...props }: React.ComponentProps<'li'>) {
  return <li data-slot="breadcrumb-item" className={cn('inline-flex items-center gap-1', className)} {...props} />;
}

function BreadcrumbLink({ className, children, ...props }: React.ComponentProps<'a'>) {
  return (
    <a
      data-slot="breadcrumb-link"
      className={cn(
        'inline-flex items-center gap-1 text-primary [&>svg]:size-4 lg:[&>svg]:size-6 font-bold underline hover:text-primary-700 outline-none focus-visible:rounded-xs focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white',
        className,
      )}
      {...props}
    >
      {children}
      <ChevronRight />
    </a>
  );
}

function BreadcrumbPage({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="breadcrumb-page"
      role="link"
      aria-disabled="true"
      aria-current="page"
      className={cn(className)}
      {...props}
    />
  );
}

function BreadcrumbBackLink({ className, ...props }: React.ComponentProps<'a'>) {
  const t = useTranslations('breadcrumb');
  return (
    <a
      data-slot="breadcrumb-back-link"
      aria-label={t('backLinkAriaLabel')}
      className={cn(
        'flex items-center justify-center gap-1 pr-4 underline cursor-pointer [&>svg]:size-4 lg:[&>svg]:size-6 hover:text-primary-700 outline-none focus-visible:rounded-xs focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white',
        className,
      )}
      {...props}
    >
      <ChevronLeftIcon className="size-4" />
      <span className="sr-only">{t('backLink')}</span>
      <span aria-hidden="true">{t('backLink')}</span>
    </a>
  );
}

export { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbBackLink };
