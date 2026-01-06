'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { PasswordResetDialog } from '@/components/password/password-reset-dialog';

export default function PasswordResetInterceptPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') ?? undefined;

  return (
    <PasswordResetDialog
      open={true}
      onCloseAction={() => router.back()}
      onBackToLoginAction={(email) => router.push(`/login?email=${encodeURIComponent(email)}`)}
      email={email}
    />
  );
}
