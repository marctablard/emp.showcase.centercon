import * as React from 'react';
import { cn } from '@/lib/utils';

function Textarea({ className, maxLength, ...props }: React.ComponentProps<'textarea'>) {
  const textValue = props.value ? (props.value as string) : '';
  return (
    <div className="flex flex-col gap-2">
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
        maxLength={maxLength}
        {...props}
      />
      <div className="text-xs text-neutral-300">
        {textValue.length || 0}/{maxLength}
      </div>
    </div>
  );
}

export { Textarea };
