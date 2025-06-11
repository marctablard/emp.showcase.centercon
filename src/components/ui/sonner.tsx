'use client';

import { useTheme } from 'next-themes';
import { CircleCheck, CircleX, Info, TriangleAlert, X } from 'lucide-react';
import { Toaster as Sonner, ToasterProps } from 'sonner';
import { toast as sonnerToast } from 'sonner';
import { cn } from '@/lib/utils';

interface ToastProps {
  id: string | number;
  title: string;
  description: string;
  button: {
    label: string;
    onClick: () => void;
  };
  className: string;
}

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group bg-success-100"
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',
        } as React.CSSProperties
      }
      toastOptions={{
        unstyled: true,
        classNames: {
          error: 'bg-warning-400',
          success: 'bg-success-100',
          warning: 'bg-warning-400',
          info: 'bg-tertiary-100',
          title: 'text-base',
          toast: 'm-2',
        },
      }}
      icons={{
        success: <CircleCheck />,
        info: <Info />,
        warning: <TriangleAlert />,
        error: <CircleX />,
      }}
      {...props}
    />
  );
};

function Toast(props: ToastProps) {
  const { title, description, button, id, className } = props;

  return (
    <div
      className={cn(
        'flex rounded-t-lg border border-b-0 shadow-2xl w-full md:max-w-[300px] items-center p-3',
        'bg-' + className + '-100 border-' + className + '-400 ',
      )}
    >
      <div className="flex flex-col gap-3 w-full">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 text-success-600">
            {className === 'success' && <CircleCheck className="h-6 w-6" />}
            <p className="text-base font-bold text-neutral-900 m-0">{title}</p>
          </div>
          <div
            onClick={() => {
              button.onClick();
              sonnerToast.dismiss(id);
            }}
          >
            <X className="h-6 w-6" />
          </div>
        </div>
        <div className="">
          <p className="text-base text-neutral-900">{description}</p>
        </div>
        <div className="flex">
          <div
            className="rounded border border-black bg-transparent p-2 text-black font-bold"
            onClick={() => {
              button.onClick();
              sonnerToast.dismiss(id);
            }}
          >
            {button.label}
          </div>
        </div>
      </div>
      <div className="ml-5 shrink-0 rounded-md text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-hidden"></div>
    </div>
  );
}

export { Toaster, Toast };
