'use client';

import { ToasterProps, toast as sonnerToast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Toast } from '@/components/ui/sonner';

export default function NotificationSytelguide() {
  const message =
    'Message - Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.';
  const title = 'Title';

  interface ToastProps {
    id: string | number;
    title: string;
    description: string;
    button: {
      label: string;
      onClick: () => void;
    };
  }

  function toast(toast: Omit<ToastProps, 'id'>) {
    return sonnerToast.custom((id) => (
      <Toast
        id={id}
        title={toast.title}
        description={toast.description}
        button={{
          label: toast.button.label,
          onClick: () => console.log('Button clicked'),
        }}
        className="success"
      />
    ));
  }

  return (
    <div className="py-12">
      <h4 className="text-3xl/5 md:text-4xl font-bold text-headlines font-headlines mb-3">Notifications</h4>
      <div className="flex gap-4">
        <Button
          variant="secondary"
          onClick={() =>
            toast({
              title: title,
              description: message,
              button: {
                label: 'BUTTON',
                onClick: () => console.log('Button clicked'),
              },
            })
          }
        >
          Alert Success
        </Button>
        {/*     <Button
                    variant="secondary"
                    onClick={() =>
                        toast("Event has been created", {
                            description: "Sunday, December 03, 2023 at 9:00 AM",
                            action: {
                                label: "Undo",
                                onClick: () => console.log("Undo"),
                            },
                        })
                    }
                >
                    Alert Warning
                </Button>
                <Button
                    variant="secondary"
                    onClick={() =>
                        toast("Event has been created", {
                            description: "Sunday, December 03, 2023 at 9:00 AM",
                            action: {
                                label: "Undo",
                                onClick: () => console.log("Undo"),
                            },
                        })
                    }
                >
                    Alert Error
                </Button>
                <Button
                    variant="secondary"
                    onClick={() =>
                        toast("Event has been created", {
                            description: "Sunday, December 03, 2023 at 9:00 AM",
                            action: {
                                label: "Undo",
                                onClick: () => console.log("Undo"),
                            },
                        })
                    }
                >
                    Alert Info
                </Button> */}
      </div>
    </div>
  );
}
