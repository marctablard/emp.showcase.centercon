'use client';

import * as React from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';
import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip';

export interface LabelProps extends React.ComponentProps<typeof LabelPrimitive.Root> {
  isOptional?: boolean;
  hasTooltip?: boolean;
  tooltipText?: string;
}
function Label({ className, isOptional, hasTooltip, tooltipText, ...props }: LabelProps) {
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
      {hasTooltip && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Info className="text-primary-500" />
          </TooltipTrigger>
          <TooltipContent>
            <p className="w-full">{tooltipText}</p>
          </TooltipContent>
        </Tooltip>
      )}
      {isOptional && <p className="text-xs font-normal text-gray-500">(optional)</p>}
    </LabelPrimitive.Root>
  );
}

export { Label };
