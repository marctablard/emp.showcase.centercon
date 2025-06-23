import { withAuth } from 'next-auth/middleware';
import createIntlMiddleware from 'next-intl/middleware';
import { NextRequest } from 'next/server';

const locales = ['en', 'de'];
const securedPages = ['/account'];

const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale: 'en',
  localePrefix: 'as-needed',
});

const authMiddleware = withAuth(
  // Note that this callback is only invoked if
  // the `authorized` callback has returned `true`
  // and not for pages listed in `pages`.
  function onSuccess(req) {
    return intlMiddleware(req);
  },
  {
    callbacks: {
      authorized: ({ token }) => token != null,
    },
    pages: {
      signIn: '/login',
      error: '/login',
    },
  },
);

export default function middleware(req: NextRequest) {
  /**
   * RegExplanation:
   * - `^` : Start of the string
   * - `(/(${locales.join('|')}))?` : Optional locale prefix
   * - `(${securedPages.join('|')})` : One of the secured pages (MUST match, no question mark!)
   * - `(\/.*)?` : Optional path parameters after secured page
   * - `/?$` : Optional trailing slash
   */
  const securedPathnameRegex = RegExp(`^(/(${locales.join('|')}))?(${securedPages.join('|')})(\/.*)?/?$`, 'i');
  const isSecuredPage = securedPathnameRegex.test(req.nextUrl.pathname);
  if (!isSecuredPage) {
    return intlMiddleware(req);
  } else {
    return (authMiddleware as any)(req);
  }
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
