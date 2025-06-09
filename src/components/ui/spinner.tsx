'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

interface SpinnerProps {
  variant?: 'sm' | 'md' | 'lg';
  className?: string;
  loadingText?: string;
}

/**
 * Spinner component for loading states
 */
export const Spinner: React.FC<SpinnerProps> = ({ loadingText, variant = 'md', className }) => {
  const t = useTranslations('ui.spinner');
  const variants = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4',
  };

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-solid border-primary border-t-transparent',
        variants[variant],
        className,
      )}
      role="status"
      aria-label={loadingText || t('loading')}
    >
      <span className="sr-only">{loadingText || t('loading')}</span>
    </div>
  );
};
