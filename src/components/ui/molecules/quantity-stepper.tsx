'use client';

import { useCallback } from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'md';
  decrementLabel?: string;
  incrementLabel?: string;
  inputLabel?: string;
  onDelete?: () => void;
}

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 999,
  disabled = false,
  className,
  size = 'md',
  onDelete,
}: QuantityStepperProps) {
  const height = size === 'sm' ? 'h-9' : 'h-12';
  const iconSize = size === 'sm' ? 'size-3.5' : 'size-4';
  const isAtMin = value <= min;
  const showDelete = isAtMin && !!onDelete;

  const handleDecrement = useCallback(() => {
    if (value > min) {
      onChange(value - 1);
    }
  }, [value, min, onChange]);

  const handleIncrement = useCallback(() => {
    if (value < max) {
      onChange(value + 1);
    }
  }, [value, max, onChange]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const parsed = parseInt(e.target.value, 10);
      if (!isNaN(parsed)) {
        onChange(Math.min(max, Math.max(min, parsed)));
      }
    },
    [min, max, onChange],
  );

  return (
    <div className={cn('flex items-center', className)}>
      <Button
        variant="secondary"
        size="icon"
        className={cn(
          'border-e-0 border-border-primary rounded-none rounded-ss-sm rounded-es-sm disabled:border-border-primary',
          height,
        )}
        onClick={showDelete ? onDelete : handleDecrement}
        disabled={disabled || (isAtMin && !onDelete)}
        aria-label={showDelete ? 'Remove item' : 'Decrease quantity'}
        data-testid="quantity-stepper-decrement"
      >
        {showDelete ? <Trash2 className={iconSize} /> : <Minus className={iconSize} />}
      </Button>
      <Input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={handleInputChange}
        disabled={disabled}
        aria-label="Quantity"
        data-testid="quantity-stepper-input"
        className={cn(
          'text-center min-w-[3rem] w-16 border border-border-primary rounded-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
          height,
        )}
      />
      <Button
        variant="secondary"
        size="icon"
        className={cn(
          'border-s-0 border-border-primary rounded-none rounded-ee-sm rounded-se-sm disabled:border-border-primary',
          height,
        )}
        onClick={handleIncrement}
        disabled={disabled || value >= max}
        aria-label="Increase quantity"
        data-testid="quantity-stepper-increment"
      >
        <Plus className={iconSize} />
      </Button>
    </div>
  );
}
