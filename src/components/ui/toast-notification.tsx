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

export interface NotificationProps {
  id: string | number;
  title: string;
  button: {
    label: string;
    onClick: () => void;
  };
  type: ToastType;
}

function toast(toast: Omit<ToastProps, 'id'>) {
  return sonnerToast.custom(
    (id) => (
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
    ),
    {
      duration: 4000,
      position: 'bottom-center',
      className: 'w-full pb-[60px] md:pb-2 md:px-4 md:flex md:justify-end md:[&>div]:max-w-[300px]',
    },
  );
}

function notify(toast: Omit<NotificationProps, 'id'>) {
  return sonnerToast.custom(
    (id) => (
      <Notification
        id={id}
        title={toast.title}
        button={{
          label: toast.button.label,
          onClick: toast.button.onClick,
        }}
        type={toast.type}
      />
    ),
    {
      position: 'top-center',
      duration: 400000,
      className: 'w-full mt-17 md:mt-30 lg:mt-44 md:[&>div]:mx-4 lg:[&>div]:mx-9',
    },
  );
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
        'rounded border shadow-2xl w-full items-center p-4',
        'top-right',
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

function Notification(props: NotificationProps) {
  const { title, button, id, type } = props;

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
        'flex rounded border shadow-2xl w-full items-center md:p-3 p-1',
        'top-right',
        'bg-' + className[type] + '-100 border-' + className[type] + '-500 ',
      )}
    >
      <div className="flex gap-2 w-full">
        <div className="flex w-full justify-center items-center">
          <div className={cn('flex items-center gap-2', 'text-' + className[type] + '-500')}>
            {icon[type]}
            <p className="text-base font-bold text-neutral-900 m-0">{title}</p>
          </div>
        </div>
        <div
          className="flex justify-end items-center"
          onClick={() => {
            button.onClick();
            sonnerToast.dismiss(id);
          }}
        >
          <X className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}

export { Toast, toast, Notification, notify };
