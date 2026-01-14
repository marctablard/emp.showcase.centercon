import NextAuth, { NextAuthRequest } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { config as authConfig } from './auth/auth.config';
import { applyCacheDirectives } from './cache-middleware';
import { createSiteMiddleware } from './site/middleware';
import { routing as siteRouting } from './site/routing';
import { NEXT_REWRITE_HEADER } from './site/types';

const securedPages = ['/account/.*?'];
//const securedPathnameRegex = RegExp(`^(/(${intlRouting.locales.join('|')}))?(${securedPages.join('|')})(/.*)?/?$`, 'i');
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

const authMiddleware = auth(async (req: NextAuthRequest) => {
  const { pathname } = req.nextUrl;
  console.log('pathname', pathname);
  const isAuthenticated = !!req.auth?.user;
  if (pathname.startsWith('/api/')) {
    // 1) Bypass certain API prefixes (e.g., NextAuth and CSRF endpoint)
    if (startsWithAny(pathname, apiBypassPrefixes)) {
      return NextResponse.next();
    }

    // 2) Require auth for secured API prefixes (return 401 for unauthenticated)
    if (!isAuthenticated && startsWithAny(pathname, securedApiPrefixes)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 3) Apply CSRF validation for remaining API requests
    const csrfResult = validateCsrf(req);
    if (csrfResult) {
      return csrfResult;
    }

    const response = NextResponse.next();
    return applyCacheDirectives(req, response, isAuthenticated);
  }

  // 5) Protect /account/* routes (but not /account itself)
  if (!isAuthenticated && pathname.match(/\/account\/[^/]+/)) {
    const url = req.nextUrl.clone();
    url.pathname = url.pathname.replace(/\/account\/.*$/, '/account');
    return NextResponse.redirect(url);
  }

  const response = siteMiddleware(req);
  const siteLocation = response.headers.get('location');
  if (siteLocation) {
    // leave redirect untouched
    return response;
  }

  const siteRewriteHeader = response.headers.get(NEXT_REWRITE_HEADER);
  const url = siteRewriteHeader ? new URL(siteRewriteHeader) : req.nextUrl.clone();
  // 6) Handle product page routing with customer-specific URLs
  const productMatch = url.pathname.match(/^(.*)\/product\/([^/]+)$/);
  if (productMatch) {
    const [, pathPrefix, productId] = productMatch;
    if (isAuthenticated) {
      url.pathname = `${pathPrefix}/product/AUTHENTICATED_${productId}`;
      return NextResponse.rewrite(url, { request: { headers: req.headers } });
    }
  }
  return applyCacheDirectives(req, response, isAuthenticated);
});

export default async function middleware(req: NextRequest) {
  const response = await (authMiddleware as (req: NextRequest) => Promise<NextResponse>)(req);
  return response;
}

export const config = {
  matcher: ['/((?!_next|.well-known\\.*|.*\\..*).*)'],
};
