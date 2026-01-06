'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { LoginForm } from '@/components/login/login-form';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') ?? undefined;
  const email = searchParams.get('email') ?? undefined;
  const guestCheckout = searchParams.get('guestCheckout') === 'true';

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="w-full max-w-[639px] p-6">
        <LoginForm
          callbackUrl={callbackUrl}
          email={email}
          onSuccess={() => router.push('/')}
          guestCheckout={guestCheckout}
        />
      </div>
    </div>
  );
}
