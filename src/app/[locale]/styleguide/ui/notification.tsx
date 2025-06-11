'use client';

import { Button } from '@/components/ui/button';
import { ToastType, toast } from '@/components/ui/toast-notification';

export default function NotificationSytelguide() {
  const message =
    'Message - Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.';
  const title = 'Title';

  return (
    <div className="py-12">
      <h4 className="text-3xl/5 md:text-4xl font-bold text-headlines font-headlines mb-3">Notifications</h4>
      <div className="flex gap-4">
        <Button
          variant="secondary"
          className="text-success-500 border-success-500"
          onClick={() =>
            toast({
              title: title,
              description: message,
              button: { label: 'Undo', onClick: () => console.log('Button clicked') },
              type: ToastType.Success,
            })
          }
        >
          Alert Success
        </Button>
        <Button
          variant="secondary"
          className="text-warning-500 border-warning-500"
          onClick={() =>
            toast({
              title: title,
              description: message,
              button: { label: 'Undo', onClick: () => console.log('Button clicked') },
              type: ToastType.Warning,
            })
          }
        >
          Alert Warning
        </Button>
        <Button
          variant="secondary"
          className="text-danger-500 border-danger-500"
          onClick={() =>
            toast({
              title: title,
              description: message,
              button: { label: 'Undo', onClick: () => console.log('Button clicked') },
              type: ToastType.Error,
            })
          }
        >
          Alert Error
        </Button>
        <Button
          variant="secondary"
          className="text-tertiary-500 border-tertiary-500"
          onClick={() =>
            toast({
              title: title,
              description: message,
              button: { label: 'Undo', onClick: () => console.log('Button clicked') },
              type: ToastType.Info,
            })
          }
        >
          Alert Info
        </Button>
      </div>
    </div>
  );
}
