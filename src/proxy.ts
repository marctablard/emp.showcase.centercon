import { NextAuthRequest } from 'next-auth';
import NextAuth from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { config as authConfig } from './auth/auth.config';
import { getPathname } from './i18n/navigation';
import { routing as intlRouting } from './i18n/routing';
import { createSiteMiddleware } from './site/middleware';
import { routing as siteRouting } from './site/routing';

const securedPages = ['/account/.*?'];
const securedPathnameRegex = RegExp(`^(/(${intlRouting.locales.join('|')}))?(${securedPages.join('|')})(/.*)?/?$`, 'i');
const securedApiPrefixes = securedPages.filter((p) => p.startsWith('/api/shipping'));

const apiBypassPrefixes = ['/api/auth', '/api/csrf', '/api/notifications'];

const startsWithAny = (path: string, prefixes: string[]) => prefixes.some((p) => path.startsWith(p));

// Simplified Instance of NextAuth for Edge Middleware (cannot use server context)
const { auth } = NextAuth(authConfig);

const siteMiddleware = createSiteMiddleware(siteRouting);

/**
 * Validates CSRF token for protected routes
 * @param req NextRequest object
 * @returns Response if CSRF validation fails, undefined otherwise
 */
function validateCsrf(req: NextRequest): Response | NextResponse | undefined {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return undefined;
  }

  const csrfToken = req.headers.get('x-csrf-token');
  const storedToken = req.cookies.get('csrf-token')?.value;

  if (!csrfToken || !storedToken || csrfToken !== storedToken) {
    return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 });
  }
}

export default auth(async (req: NextAuthRequest) => {
  const { pathname } = req.nextUrl;
  const locale = req.nextUrl.locale;

  if (pathname.startsWith('/api/')) {
    // 1) Bypass certain API prefixes (e.g., NextAuth and CSRF endpoint)
    if (startsWithAny(pathname, apiBypassPrefixes)) {
      return NextResponse.next();
    }

    // 2) Require auth for secured API prefixes (return 401 for unauthenticated)
    if (!req.auth?.user && startsWithAny(pathname, securedApiPrefixes)) {
      const path = getPathname({ href: '/account', locale });
      return NextResponse.redirect(new URL(path, req.url));
    }

    // 3) Apply CSRF validation for remaining API requests
    const csrfResult = validateCsrf(req);
    if (csrfResult) return csrfResult;
  }

  if (!req.auth?.user && securedPathnameRegex.test(pathname)) {
    const path = getPathname({ href: '/account', locale });
    const originalUrl = new URL(req.url);
    const base = originalUrl.protocol + '//' + originalUrl.host;
    return NextResponse.redirect(base + path.substring(1));
  }

  return siteMiddleware(req) ?? NextResponse.next();
});

export const config = {
  matcher: ['/((?!_next|api|.well-known\\.*|.*\\..*).*)'],
};
