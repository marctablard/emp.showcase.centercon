import * as React from 'react';
import { cn } from '@/lib/utils';

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'text-neutral-900 flex w-full min-w-0 px-3 border border-neutral-200 rounded-sm text-base text-neutral-800',
        'placeholder:text-base placeholder:text-neutral-300 p-3',
        'transition-all hover:border-primary-500 hover:border-primary-700 hover:bg-white',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500',
        'disabled:cursor-not-allowed',
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
