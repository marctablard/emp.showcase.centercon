import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
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
  return <li data-slot="breadcrumb-item" className={cn('inline-flex items-center gap-1.5', className)} {...props} />;
}

function BreadcrumbLink({
  asChild,
  className,
  ...props
}: React.ComponentProps<'a'> & {
  asChild?: boolean;
}) {
  const Comp = asChild ? Slot : 'a';

  return (
    <Comp
      data-slot="breadcrumb-link"
      className={cn(
        'inline-flex items-center gap-1 text-primary font-bold underline hover:text-primary-700 outline-none focus-visible:rounded-xs focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white',
        className,
      )}
      {...props}
    />
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

function BreadcrumbSeparator({ children, className, ...props }: React.ComponentProps<'li'>) {
  return (
    <li
      data-slot="breadcrumb-separator"
      role="presentation"
      aria-hidden="true"
      className={cn('[&>svg]:size-4 lg:[&>svg]:size-6 text-primary', className)}
      {...props}
    >
      {children ?? <ChevronRight />}
    </li>
  );
}

function BreadcrumbBackLink({ className, ...props }: React.ComponentProps<'a'>) {
  return (
    <a
      data-slot="breadcrumb-back-link"
      aria-label="Go back to the previous page"
      className={cn('flex size-9 items-center justify-center', className)}
      {...props}
    >
      <ChevronLeftIcon className="size-4" />
      <span className="sr-only">Back</span>
      <span aria-hidden="true">Back</span>
    </a>
  );
}

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbBackLink,
};
