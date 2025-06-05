'use client';

import * as React from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';
import { Info, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip';

export interface LabelProps extends React.ComponentProps<'label'> {
  isOptional?: boolean;
}

const Label = React.forwardRef<HTMLInputElement, LabelProps>(({ className, isOptional, ...props }, ref) => {
  const IsOptional = isOptional;
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        'flex items-center gap-2 text-base leading-none font-semibold select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
        className,
      )}
      {...props}
    >
      <div>{props.children}</div>

      <Tooltip>
        <TooltipTrigger asChild>
          <Info className="text-indigo-500" />
        </TooltipTrigger>
        <TooltipContent>
          <p>Test</p>
        </TooltipContent>
      </Tooltip>
      {IsOptional && <p className="text-xs font-normal text-gray-500">(optional)</p>}
    </LabelPrimitive.Root>
  );
});

export { Label };
