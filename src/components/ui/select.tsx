'use client';

import * as React from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { ChevronDownIcon, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SelectProps extends React.ComponentProps<typeof SelectPrimitive.Trigger> {
  startIcon?: LucideIcon;
  endIcon?: LucideIcon;
}

function Select({ ...props }: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />;
}

function SelectGroup({ ...props }: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />;
}

function SelectValue({ ...props }: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" className="text-neutral-800 " {...props} />;
}

function SelectTrigger({ className, children, disabled, startIcon, ...props }: SelectProps) {
  const StartIcon = startIcon;
  const dataDirtySuccess = 'data-dirty-success' in props ? (props['data-dirty-success'] as boolean) : false;
  const dataDirtyError = 'data-dirty-error' in props ? (props['data-dirty-error'] as boolean) : false;

  return (
    <div
      className={cn(
        'w-full relative ',
        'transition-all hover:text-primary-700 hover:bg-white',
        dataDirtySuccess && 'text-success-500 border-success-500',
        props['aria-invalid'] && 'border-danger-500 text-danger-500',
        disabled && 'hover:text-neutral-600',
      )}
    >
      {StartIcon && (
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
          <StartIcon size={20} />
        </div>
      )}

      <SelectPrimitive.Trigger
        data-slot="select-trigger"
        className={cn(
          'text-neutral-900 group flex justify-between items-center w-full min-w-0 px-3 border border-neutral-200 rounded-sm',
          'transition duration-150 ease-in-out hover:border-primary-700 hover:text-primary-700 hover:bg-white',
          startIcon && 'pl-10',
          disabled &&
            'bg-neutral-100 text-neutral-600 border-neutral-300 hover:text-neutral-600 hover:bg-neutral-100 hover:border-neutral-300 pointer-events-none',
          'data-[state=open]:outline-2 data-[state=open]:outline-offset-2 data-[state=open]:outline-primary-500',
          'aria-invalid:text-danger-500 aria-invalid:border-danger-500 hover:aria-invalid:border-primary-500 hover:aria-invalid:text-primary-700',
          "data-[placeholder]:text-neutral-300 flex w-full rounded-md text-base py-3 [&_svg:not([class*='size-'])]:size-5",
          dataDirtySuccess && 'bg-success-100 border-success-500 hover:border-primary-500 hover:text-primary-700',
          dataDirtyError && 'bg-danger-100 hover:border-primary-500 hover:text-primary-700',
          className,
        )}
        {...props}
      >
        {children}
        <SelectPrimitive.Icon asChild>
          <ChevronDownIcon
            className={cn(
              'size-4 text-neutral-900 transition-transform duration-200 group-data-[state=open]:rotate-180',
            )}
          />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
    </div>
  );
}

function SelectContent({
  className,
  children,
  position = 'popper',
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        className={cn(
          'mt-1 bg-popover data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border shadow-md',
          position === 'popper' &&
            'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
          className,
        )}
        position={position}
        {...props}
      >
        <SelectPrimitive.Viewport
          className={cn(
            position === 'popper' &&
              'h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1',
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

function SelectLabel({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn('text-muted-foreground px-2 py-1.5 text-xs', className)}
      {...props}
    />
  );
}

function SelectItem({
  className,
  children,
  disabled,
  startIcon,
  endIcon,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item> & SelectProps) {
  const StartIcon = startIcon;
  const EndIcon = endIcon;

  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        'w-full relative divide-y',
        disabled && 'bg-neutral-100 border-neutral-300 text-neutral-600 pointer-events-none',
        'transition-all hover:text-primary-700 hover:bg-primary-50 hover:border-primary-500',
        disabled && 'hover:bg-neutral-400 hover:text-white',
        'data-[state=checked]:bg-primary-500 data-[state=checked]:text-white hover:data-[state=checked]:bg-primary-700',
        className,
      )}
      {...props}
    >
      {StartIcon && (
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
          <StartIcon size={20} />
        </div>
      )}

      <div
        className={cn(
          'relative flex w-full cursor-default items-center gap-2 rounded-sm py-3 pr-8 text-base outline-hidden select-none data-[disabled]:pointer-events-none',
          "hover:text-neutral-900'",
          startIcon && 'pl-10',
          endIcon && 'pr-10',
          className,
        )}
      >
        <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      </div>

      {EndIcon && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <EndIcon size={20} />
        </div>
      )}
    </SelectPrimitive.Item>
  );
}

function SelectSeparator({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn('bg-border pointer-events-none h-px', className)}
      {...props}
    />
  );
}

export { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue };
