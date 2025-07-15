import type { NextAuthConfig } from 'next-auth';

export default {
  debug: false,
  theme: { logo: 'https://authjs.dev/img/logo-sm.png' },
  providers: [],
  pages: {
    signIn: '/',
    error: '/?error',
  },
} satisfies NextAuthConfig;
