import { NextAuthRequest } from 'next-auth';
import NextAuth from 'next-auth';
import createIntlMiddleware from 'next-intl/middleware';
import authConfig from './auth/auth.config';

const locales = ['en', 'de'];
const defaultLocale = 'en';
const securedPages = ['/account'];
const securedPathnameRegex = RegExp(`^(/(${locales.join('|')}))?(${securedPages.join('|')})(\/.*)?/?$`, 'i');

const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed',
});

// Simplified Instance of NextAuth for Edge Middleware (cannot use server context)
const { auth } = NextAuth(authConfig);

export default auth((req: NextAuthRequest) => {
  if (!req.auth?.user) {
    const isSecuredPage = securedPathnameRegex.test(req.nextUrl.pathname);
    if (isSecuredPage) {
      return Response.redirect(new URL('/', req.url));
    }
  }
  return intlMiddleware(req);
});

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
