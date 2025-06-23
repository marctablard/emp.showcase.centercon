import { User } from 'lucide-react';
import LoginDialog from '@/components/login/login-dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function DialogStyleguide() {
  return (
    <div className="py-12 space-y-12">
      <div>
        <h4 className="text-3xl/5 md:text-4xl font-bold text-headlines font-headlines mb-6">Dialog</h4>
        <p className="text-lg mb-8">Examples of different ways to open and control dialogs.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="p-6">
          <h5 className="text-xl font-semibold mb-4">Dialog with Button Trigger</h5>
          <p className="mb-6">Dialog with a button as trigger</p>
          <LoginDialog trigger={<Button variant="primary">Open Login</Button>} />
        </Card>

        <Card className="p-6">
          <h5 className="text-xl font-semibold mb-4">Dialog with Text Trigger</h5>
          <p className="mb-6">Dialog with text as trigger</p>
          <LoginDialog trigger={<span className="text-primary underline cursor-pointer">Click here to login</span>} />
        </Card>

        <Card className="p-6">
          <h5 className="text-xl font-semibold mb-4">Dialog with Icon Trigger</h5>
          <p className="mb-6">Dialog with icon as trigger</p>
          <LoginDialog
            trigger={
              <div className="flex items-center gap-2 cursor-pointer text-primary">
                <User />
                <span>Login</span>
              </div>
            }
          />
        </Card>
      </div>
    </div>
  );
}
