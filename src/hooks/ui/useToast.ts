'use client';

import { ToastType, toast as showToast } from '@/components/ui/toast-notification';

interface ToastOptions {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success';
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function useToast() {
  const toast = (options: ToastOptions) => {
    const { title, description = '', variant = 'default', action } = options;

    let type = ToastType.Info;

    switch (variant) {
      case 'destructive':
        type = ToastType.Error;
        break;
      case 'success':
        type = ToastType.Success;
        break;
      default:
        type = ToastType.Info;
    }

    return showToast({
      title,
      description,
      type,
      button: {
        label: action?.label || 'Close',
        onClick: action?.onClick || (() => {}),
      },
    });
  };

  return { toast };
}
