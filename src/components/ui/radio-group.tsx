'use client';

import * as React from 'react';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { CircleIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

function RadioGroup({ className, ...props }: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return <RadioGroupPrimitive.Root data-slot="radio-group" className={cn('grid gap-3', className)} {...props} />;
}

function RadioGroupItem({ className, ...props }: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        'bg-white border border-neutral-200 data-[state=checked]bg-primary-500 size-6 shrink-0 rounded-full',
        'transition-all hover:border-primary-700 hover:bg-primary-50',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500',
        'aria-invalid:text-danger-500 aria-invalid:border-danger-500 hover:aria-invalid:border-primary-500 hover:aria-invalid:text-primary-700 aria-invalid:data-[state=checked]:bg-danger-100',
        'data-[state=checked]:bg-primary-500 hover:data-[state=checked]:bg-primary-700',
        'disabled:pointer-events-none disabled:cursor-not-allowed disabled:text-neutral-600 disabled:bg-neutral-100 disabled:border-neutral-300 disabled:aria-invalid:border-neutral-300',
        className,
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="relative flex items-center justify-center"
      >
        <CircleIcon
          className={cn(
            'fill-white stroke-none absolute top-1/2 left-1/2 size-3 -translate-x-1/2 -translate-y-1/2',
            props['aria-invalid'] && props['checked'] && 'fill-danger-500',
          )}
        />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
}

export { RadioGroup, RadioGroupItem };
