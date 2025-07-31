'use client';

import { Button } from '@/components/ui/button';
import { ToastType, notify, toast } from '@/components/ui/toast-notification';

export default function NotificationStyleguide() {
  const description =
    'Message - Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.';
  const title = 'Title';
  const message = 'Message';

  return (
    <div className="py-12">
      <h4 className="text-3xl/5 md:text-4xl font-bold text-headlines font-headlines mb-3">Notifications</h4>
      <div className="flex flex-col gap-10">
        <div className="flex flex-col">
          <h5 className="text-2xl/5 md:text-3xl font-bold text-headlines font-headlines mb-3">Toasts</h5>
          <div className="flex flex-wrap gap-4">
            <Button
              variant="secondary"
              className="text-success-500 border-success-500"
              onClick={() =>
                toast({
                  title: title,
                  description: description,
                  button: { label: 'BUTTON', onClick: () => console.log('Button clicked') },
                  type: ToastType.Success,
                })
              }
            >
              Alert Success Toast
            </Button>
            <Button
              variant="secondary"
              className="text-warning-500 border-warning-500"
              onClick={() =>
                toast({
                  title: title,
                  description: description,
                  button: { label: 'BUTTON', onClick: () => console.log('Button clicked') },
                  type: ToastType.Warning,
                })
              }
            >
              Alert Warning Toast
            </Button>
            <Button
              variant="secondary"
              className="text-danger-500 border-danger-500"
              onClick={() =>
                toast({
                  title: title,
                  description: description,
                  button: { label: 'BUTTON', onClick: () => console.log('Button clicked') },
                  type: ToastType.Error,
                })
              }
            >
              Alert Error Toast
            </Button>
            <Button
              variant="secondary"
              className="text-tertiary-500 border-tertiary-500"
              onClick={() =>
                toast({
                  title: title,
                  description: description,
                  button: { label: 'BUTTON', onClick: () => console.log('Button clicked') },
                  type: ToastType.Info,
                })
              }
            >
              Alert Info Toast
            </Button>
          </div>
        </div>
        <div className="flex flex-col">
          <h5 className="text-2xl/5 md:text-3xl font-bold text-headlines font-headlines mb-3">Globals</h5>
          <div className="flex flex-wrap gap-4">
            <Button
              variant="secondary"
              className="text-success-500 border-success-500"
              onClick={() =>
                notify({
                  title: message,
                  button: { label: 'Undo', onClick: () => console.log('Button clicked') },
                  type: ToastType.Success,
                })
              }
            >
              Alert Success Global
            </Button>
            <Button
              variant="secondary"
              className="text-warning-500 border-warning-500"
              onClick={() =>
                notify({
                  title: message,
                  button: { label: 'Undo', onClick: () => console.log('Button clicked') },
                  type: ToastType.Warning,
                })
              }
            >
              Alert Warning Global
            </Button>
            <Button
              variant="secondary"
              className="text-danger-500 border-danger-500"
              onClick={() =>
                notify({
                  title: message,
                  button: { label: 'Undo', onClick: () => console.log('Button clicked') },
                  type: ToastType.Error,
                })
              }
            >
              Alert Error Global
            </Button>
            <Button
              variant="secondary"
              className="text-tertiary-500 border-tertiary-500"
              onClick={() =>
                notify({
                  title: message,
                  button: { label: 'Undo', onClick: () => console.log('Button clicked') },
                  type: ToastType.Info,
                })
              }
            >
              Alert Info Global
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
