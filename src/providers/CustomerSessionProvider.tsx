'use client';

import { Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';

// Wrapper around the Next-Auth SessionProvider that otherwise fails to render in a React Server Component
export default function AuthSessionProvider({
  children,
  session,
}: {
  children: React.ReactNode;
  session: Session | null;
}) {
  return <SessionProvider session={session}>{children}</SessionProvider>;
}
