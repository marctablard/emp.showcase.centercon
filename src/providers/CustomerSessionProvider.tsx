'use client';

import { SessionProvider } from 'next-auth/react';

// Wrapper around the Next-Auth SessionProvider that otherwise fails to render in a React Server Component
export default function AuthSessionProvider({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
