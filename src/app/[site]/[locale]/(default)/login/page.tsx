'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { LoginForm } from '@/components/login/login-form';
import { Card } from '@/components/ui/card';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') ?? '/account';
  const email = searchParams.get('email') ?? undefined;
  const guestCheckout = searchParams.get('guestCheckout') === 'true';

  return (
    <div className="flex items-center justify-center py-10">
      <Card className="w-full max-w-150 p-6 relative">
        <LoginForm
          callbackUrl={callbackUrl}
          email={email}
          onSuccess={() => router.push('/')}
          guestCheckout={guestCheckout}
        />
      </Card>
    </div>
  );
}
