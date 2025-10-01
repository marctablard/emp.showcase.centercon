import { NextAuthRequest } from 'next-auth';
import NextAuth from 'next-auth';
import { LocalePrefixMode } from 'next-intl/routing';
import { NextRequest, NextResponse } from 'next/server';
import authConfig from './auth/auth.config';
import { routing } from './i18n/routing';

const availableSites = process.env.NEXT_PUBLIC_AVAILABLE_SITES?.split(',') || [];
const defaultSite = process.env.NEXT_PUBLIC_DEFAULT_SITE || 'main';
if (availableSites.length === 0 || availableSites.findIndex((c) => c === defaultSite) === -1) {
  availableSites.push(defaultSite);
}
const siteRouting = {
  // A list of all locales that are supported
  sites: availableSites,
  // Used when no locale matches
  defaultSite: defaultSite,
  // Used for routing
  sitePrefix: 'as-needed' as LocalePrefixMode,
};

const securedPages = ['/account'];
const securedPathnameRegex = RegExp(`^(/(${routing.locales.join('|')}))?(${securedPages.join('|')})(/.*)?/?$`, 'i');
const securedApiPrefixes = securedPages.filter((p) => p.startsWith('/api/shipping'));

const apiBypassPrefixes = ['/api/auth', '/api/csrf', '/api/notifications'];

const startsWithAny = (path: string, prefixes: string[]) => prefixes.some((p) => path.startsWith(p));

/**
 * Combine the functionality of Internationalization and Site-Detection, allowing 'default - as-needed for both'
 * @param req
 * @returns
 */
const pathParameterMiddleware = (req: NextRequest) => {
  const { pathname } = req.nextUrl;
  // split the pathname, assuming the format /site/locale/...
  const segments = pathname.replace('/', '').split('/');
  let site = defaultSite;
  let locale = routing.defaultLocale;

  // take care of site if it's not missing from url
  if (siteRouting.sites.includes(segments[0])) {
    site = segments[0];
    segments.shift();
  }
  // handle default site without prefix
  if (siteRouting.sitePrefix === 'never' || (site == defaultSite && siteRouting.sitePrefix === 'as-needed')) {
    return NextResponse.rewrite(new URL(`/${defaultSite}/${segments.join('/')}`, req.url));
  }

  // take care of locale if it's not missing from url
  if (routing.locales.includes(segments[0])) {
    locale = segments[0];
    segments.shift();
  }
  // handle default locale without prefix
  if (routing.localePrefix === 'never' || (routing.localePrefix === 'as-needed' && locale == routing.defaultLocale)) {
    return NextResponse.rewrite(new URL(`/${site}/${locale}/${segments.join('/')}`, req.url));
  }

  const response = NextResponse.next();
  response.headers.set('x-site', site);
  response.headers.set('x-locale', locale);
  return response;
};

// Simplified Instance of NextAuth for Edge Middleware (cannot use server context)
const { auth } = NextAuth(authConfig);

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

/**
 * Apply security headers to the response
 * @param response The response to apply headers to
 * @returns Response with security headers
 */
function applySecurityHeaders(response: Response | NextResponse): Response | NextResponse {
  // Set security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Cross-Origin-Resource-Policy', process.env.CROSS_ORIGIN_RESOURCE_POLICY || 'same-site');
  response.headers.set('Cross-Origin-Opener-Policy', process.env.CROSS_ORIGIN_OPENER_POLICY || 'same-origin');
  response.headers.set('Referrer-Policy', 'no-referrer');
  response.headers.set('X-XSS-Protection', '1; mode=block');

  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  return response;
}

export default auth(async (req: NextAuthRequest) => {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith('/api/')) {
    // 1) Bypass certain API prefixes (e.g., NextAuth and CSRF endpoint)
    if (startsWithAny(pathname, apiBypassPrefixes)) {
      return applySecurityHeaders(NextResponse.next());
    }

    // 2) Require auth for secured API prefixes (return 401 for unauthenticated)
    if (!req.auth?.user && startsWithAny(pathname, securedApiPrefixes)) {
      return applySecurityHeaders(NextResponse.redirect(new URL('/login', req.url)));
    }

    // 3) Apply CSRF validation for remaining API requests
    const csrfResult = validateCsrf(req);
    if (csrfResult) return applySecurityHeaders(csrfResult);
  }

  if (!req.auth?.user) {
    const isSecuredPage = securedPathnameRegex.test(pathname);
    if (isSecuredPage) {
      return applySecurityHeaders(NextResponse.redirect(new URL('/login', req.url)));
    }
  }

  return applySecurityHeaders(pathParameterMiddleware(req) ?? NextResponse.next());
});

export const config = {
  matcher: ['/((?!_next|\\.well-known|.*\\..*).*)', '/api/:path*'],
};
