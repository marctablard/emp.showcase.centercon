'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { PasswordResetDialog } from '@/components/password/password-reset-dialog';

export default function PasswordResetPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') ?? undefined;

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <PasswordResetDialog
        open={true}
        onCloseAction={() => router.push('/')}
        onBackToLoginAction={(email) => router.push(`/login?email=${encodeURIComponent(email)}`)}
        email={email}
      />
    </div>
  );
}
