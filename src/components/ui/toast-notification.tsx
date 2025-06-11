'use client';

import { CircleCheck, CircleX, Info, TriangleAlert, X } from 'lucide-react';
import { toast as sonnerToast } from 'sonner';
import { cn } from '@/lib/utils';

export enum ToastType {
  Success = 'success',
  Error = 'error',
  Warning = 'warning',
  Info = 'info',
}

export interface ToastProps {
  id: string | number;
  title: string;
  description: string;
  button: {
    label: string;
    onClick: () => void;
  };
  type: ToastType;
}

function toast(toast: Omit<ToastProps, 'id'>) {
  return sonnerToast.custom((id) => (
    <Toast
      id={id}
      title={toast.title}
      description={toast.description}
      button={{
        label: toast.button.label,
        onClick: toast.button.onClick,
      }}
      type={toast.type}
    />
  ));
}

function Toast(props: ToastProps) {
  const { title, description, button, id, type } = props;

  const icon = {
    success: <CircleCheck />,
    info: <Info />,
    warning: <TriangleAlert />,
    error: <CircleX />,
  };

  const className = {
    success: 'success',
    info: 'tertiary',
    warning: 'warning',
    error: 'danger',
  };
  return (
    <div
      className={cn(
        'flex rounded-t-lg border border-b-0 shadow-2xl w-full md:max-w-[300px] items-center p-3',
        'bg-' + className[type] + '-100 border-' + className[type] + '-500 ',
      )}
    >
      <div className="flex flex-col gap-2 w-full">
        <div className="flex justify-between items-center">
          <div className={cn('flex items-center gap-2', 'text-' + className[type] + '-500')}>
            {icon[type]}
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
            className="rounded border border-black bg-transparent px-2 py-1 text-black font-bold"
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

export { Toast, toast };
