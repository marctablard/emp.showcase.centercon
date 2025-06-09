import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { CheckIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Label } from './label';

export interface ColorFilterProps extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
  color: string;
}
function ColorFilter({ className, color, ...props }: ColorFilterProps) {
  return (
    <div className="flex items-center gap-3 mb-1">
      <CheckboxPrimitive.Root
        className={cn(
          className,
          'group peer h-6 w-6 shrink-0 rounded-sm border hover:opacity-80 data-[state=checked]:text-white',
          '[state=checked]:' + className,
        )}
        {...props}
      >
        <CheckboxPrimitive.Indicator className={cn('flex items-center justify-center text-current')}>
          <CheckIcon className="h-6 w-6 hidden group-data-[state=checked]:block" />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
      <Label className={cn('text-base font-medium')}>{color}</Label>
    </div>
  );
}

export { ColorFilter };
