'use client';

import { ReactNode, useState } from 'react';
import { FormProvider } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Eye, EyeOff, LockKeyhole, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { H4, H5 } from '@/components/ui/h';
import { Input } from '@/components/ui/input';
import UiLink from '@/components/ui/link';
import { ToastType, notify } from '@/components/ui/toast-notification';
import { useAuthentication } from '@/hooks/authentication/useAuthentication';
import { useValidator } from '@/hooks/validation/useValidator';
import { useRouter } from '@/i18n/navigation';

type LoginData = {
  username: string;
  password: string;
};

type LoginProps = {
  callbackUrl?: string;
  trigger?: ReactNode;
  defaultOpen?: boolean;
  redirectAfterLogin?: boolean;
};

export default function LoginDialog({
  trigger,
  defaultOpen = false,
  callbackUrl,
  redirectAfterLogin = false,
}: LoginProps) {
  const t = useTranslations('login');
  const { login, loading } = useAuthentication();
  const [isOpen, setOpen] = useState(defaultOpen);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const { form } = useValidator('LoginValidationService', {
    username: '',
    password: '',
  });

  async function onSubmit(values: LoginData) {
    setError(null);

    const response = await login(values.username, values.password, false, callbackUrl);

    if (response && response.ok) {
      console.log(response);
      notify({
        title: t('welcomeMessage', { username: values.username }),
        type: ToastType.Success,
        button: {
          label: t('close'),
          onClick: () => {},
        },
      });

      setOpen(false);

      if (response.url && redirectAfterLogin) {
        router.push(response.url);
      }

      form.resetField('username', { defaultValue: '' });
      form.resetField('password', { defaultValue: '' });
    } else if (response && !response.ok) {
      if (response.error === 'CredentialsSignin') {
        setError(t('invalidCredentials'));
      } else {
        setError(t('loginError'));
      }
      form.resetField('password', { defaultValue: '' });
    } else if (!response) {
      setError(t('loginError'));
      form.resetField('password', { defaultValue: '' });
    }
  }

  const handleOpenChange = (open: boolean) => {
    // If the dialog is being closed and we're on the login page, redirect to home, because the login page is empty an only for SSR
    if (!open && window.location.pathname.endsWith('/login')) {
      setOpen(false);
      router.push('/');
      return;
    }

    // Normal behavior for all other pages
    setOpen(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}

      <DialogContent className="sm:max-w-[639px]">
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6 w-full">
            <DialogHeader>
              <VisuallyHidden>
                <DialogTitle />
                <DialogDescription />
              </VisuallyHidden>
              <H4>{t('title')}</H4>
            </DialogHeader>

            {error && (
              <div className="flex flex-col gap-2">
                <H5 className="text-danger-500">{t('error')}</H5>
                <span className="text-danger-500">{error}</span>
              </div>
            )}

            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem className="relative">
                  <FormLabel htmlFor="username">{t('username')}</FormLabel>
                  <FormControl>
                    <Input type="text" id="username" startIcon={User} {...field} />
                  </FormControl>
                  <div className="absolute top-full left-0 mt-0.5">
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            <div className="flex flex-col gap-2">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="relative">
                    <FormLabel htmlFor="password">{t('password')}</FormLabel>
                    <FormControl>
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        startIcon={LockKeyhole}
                        endIcon={showPassword ? Eye : EyeOff}
                        onEndIconClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? t('hidePassword') : t('showPassword')}
                        {...field}
                      />
                    </FormControl>
                    <div className="absolute top-full left-0 mt-0.5">
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              <DialogClose asChild>
                <UiLink
                  className="self-end"
                  type="Link"
                  href={`/password-reset${form.watch('username') ? `?email=${encodeURIComponent(form.watch('username'))}` : ''}`}
                >
                  {t('forgotPassword')}
                </UiLink>
              </DialogClose>
            </div>

            <DialogFooter className="flex flex-col sm:flex sm:flex-col gap-6 w-full">
              <Button type="submit" disabled={loading}>
                {loading ? t('loggingIn') : t('logIn')}
              </Button>

              <div className="flex flex-col gap-2 mx-auto items-center">
                <p>{t('noAccountYet')}</p>
                <DialogClose asChild>
                  <UiLink type="Link" href="/register">
                    {t('createAccount')}
                  </UiLink>
                </DialogClose>
              </div>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
