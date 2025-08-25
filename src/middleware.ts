import { NextAuthRequest } from 'next-auth';
import NextAuth from 'next-auth';
import createIntlMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { RateLimiterMemory, RateLimiterRes } from 'rate-limiter-flexible';
import authConfig from './auth/auth.config';

const locales = ['en', 'de'];
const defaultLocale = 'en';
const securedPages = ['/account', '/checkout', '/confirmation'];
const securedPathnameRegex = RegExp(`^(/(${locales.join('|')}))?(${securedPages.join('|')})(/.*)?/?$`, 'i');
const securedApiPrefixes = securedPages.filter((p) => p.startsWith('/api/shipping'));

// Rate limiting configuration (configurable via env)
const rateLimit = parseInt(process.env.RATE_LIMIT ?? '', 10) || 60;
const rateWindow = parseInt(process.env.RATE_WINDOW ?? '', 10) || 60;

const rateLimitedPaths = ['/api/auth/callback/credentials', '/api/auth/register', '/api/password-reset', '/api/cart/'];
const apiBypassPrefixes = ['/api/auth', '/api/csrf'];
const rateLimiters = new Map<string, RateLimiterMemory>();

const startsWithAny = (path: string, prefixes: string[]) => prefixes.some((p) => path.startsWith(p));

const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed',
});

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
 * Checks if the request exceeds rate limits
 * @param req NextRequest object
 * @returns Response if rate limit exceeded, undefined otherwise
 */
async function checkRateLimit(req: NextRequest, rateLimiterKey: string): Promise<Response | NextResponse | undefined> {
  if (!rateLimiters.has(rateLimiterKey)) {
    rateLimiters.set(
      rateLimiterKey,
      new RateLimiterMemory({
        points: rateLimit,
        duration: rateWindow,
        blockDuration: 60,
      }),
    );
  }

  const rateLimiter = rateLimiters.get(rateLimiterKey)!;
  const clientIp = req.headers.get('x-forwarded-for') || 'unknown';

  try {
    await rateLimiter.consume(clientIp);
    return undefined;
  } catch (error) {
    const rateLimiterRes = error as RateLimiterRes;
    const response = NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });

    if (rateLimiterRes.msBeforeNext) {
      response.headers.set('Retry-After', Math.ceil(rateLimiterRes.msBeforeNext / 1000).toString());
    }

    return response;
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
    // 1) Enforce rate limiting for selected API paths first
    const limitedMatch = rateLimitedPaths.find((p) => pathname.startsWith(p));
    if (limitedMatch) {
      const rateLimitResult = await checkRateLimit(req, limitedMatch);
      if (rateLimitResult) return applySecurityHeaders(rateLimitResult);
    }

    // 2) Bypass certain API prefixes (e.g., NextAuth and CSRF endpoint) after rate limit check
    if (startsWithAny(pathname, apiBypassPrefixes)) {
      return applySecurityHeaders(NextResponse.next());
    }

    // 3) Require auth for secured API prefixes (return 401 for unauthenticated)
    if (!req.auth?.user && startsWithAny(pathname, securedApiPrefixes)) {
      return applySecurityHeaders(NextResponse.redirect(new URL('/login', req.url)));
    }

    // 4) Apply CSRF validation for remaining API requests
    const csrfResult = validateCsrf(req);
    if (csrfResult) return applySecurityHeaders(csrfResult);
  }

  if (!req.auth?.user) {
    const isSecuredPage = securedPathnameRegex.test(pathname);
    if (isSecuredPage) {
      return applySecurityHeaders(NextResponse.redirect(new URL('/login', req.url)));
    }
  }

  //Successfully process the api request
  if (pathname.startsWith('/api/')) {
    return applySecurityHeaders(NextResponse.next());
  }

  return applySecurityHeaders(intlMiddleware(req) ?? NextResponse.next());
});

export const config = {
  matcher: ['/((?!_next|.*\\..*).*)', '/api/:path*'],
};
