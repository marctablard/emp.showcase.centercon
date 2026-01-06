'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { LoginDialog } from '@/components/login';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') ?? undefined;
  const email = searchParams.get('email') ?? undefined;
  const guestCheckout = searchParams.get('guestCheckout') === 'true';

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <LoginDialog
        open={true}
        onCloseAction={() => router.push('/')}
        onResetPasswordAction={(email) => router.push(`/password-reset?email=${encodeURIComponent(email)}`)}
        callbackUrl={callbackUrl}
        email={email}
        guestCheckout={guestCheckout}
      />
    </div>
  );
}
