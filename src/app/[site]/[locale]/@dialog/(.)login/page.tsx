'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { LoginDialog } from '@/components/login';

export default function LoginInterceptPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') ?? undefined;
  const email = searchParams.get('email') ?? undefined;
  const guestCheckout = searchParams.get('guestCheckout') === 'true';

  return (
    <LoginDialog
      open={true}
      onCloseAction={() => router.back()}
      callbackUrl={callbackUrl}
      email={email}
      guestCheckout={guestCheckout}
    />
  );
}
