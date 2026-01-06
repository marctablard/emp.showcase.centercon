'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { PasswordResetForm } from '@/components/password/password-reset-form';

export default function PasswordResetPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') ?? undefined;
  const callbackUrl = searchParams.get('callbackUrl') ?? undefined;

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="w-full max-w-150 p-6">
        <PasswordResetForm email={email} callbackUrl={callbackUrl} onSuccess={() => router.push('/')} />
      </div>
    </div>
  );
}
