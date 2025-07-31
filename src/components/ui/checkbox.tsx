'use client';

import * as React from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { CheckIcon, MinusIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      'group peer h-6 w-6 shrink-0 rounded-sm border disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=indeterminate]:bg-primary data-[state=checked]:text-primary-foreground data-[state=indeterminate]:text-primary-foreground',
      'transition-all hover:border-primary-700 hover:bg-primary-50',
      'focus:outline-2 focus:outline-offset-2 focus:outline-primary-500',
      'disabled:pointer-events-none disabled:cursor-not-allowed disabled:border-neutral-300 disabled:bg-neutral-100 aria-invalid:disabled:border-neutral-300',
      'aria-invalid:text-danger-500 aria-invalid:border-danger-500 hover:aria-invalid:border-primary-500 hover:aria-invalid:text-primary-700 aria-invalid:data-[state=indeterminate]:bg-danger-100 aria-invalid:data-[state=indeterminate]:text-danger-500 aria-invalid:data-[state=checked]:bg-danger-100 aria-invalid:data-[state=checked]:text-danger-500',
      'hover:data-[state=checked]:bg-primary-700 hover:data-[state=checked]:border-primary-700 hover:data-[state=indeterminate]:bg-primary-700 hover:data-[state=indeterminate]:border-primary-700',
      className,
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator className={cn('flex items-center justify-center text-current')}>
      <MinusIcon className="h-6 w-6 hidden group-data-[state=indeterminate]:block" />
      <CheckIcon className="h-6 w-6 hidden group-data-[state=checked]:block" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
