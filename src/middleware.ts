import { NextAuthRequest } from 'next-auth';
import NextAuth from 'next-auth';
import createIntlMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { RateLimiterMemory, RateLimiterRes } from 'rate-limiter-flexible';
import authConfig from './auth/auth.config';

const locales = ['en', 'de'];
const defaultLocale = 'en';
const securedPages = ['/account'];
const securedPathnameRegex = RegExp(`^(/(${locales.join('|')}))?(${securedPages.join('|')})(/.*)?/?$`, 'i');

const csrfProtectedPages = ['/cart', '/checkout', '/account/profile', '/account/addresses'];
const csrfPathnameRegex = RegExp(
  `^(/(${locales.join('|')}))?(${csrfProtectedPages.join('|').replace(/\//g, '\\/')})(/.*)?/?$`,
  'i',
);

// Rate limiting configuration
const rateLimit = 60;
const rateWindow = 60;

const rateLimitedPaths = ['/api/auth/login', '/api/auth/register', '/api/password-reset'];

const rateLimiters = new Map<string, RateLimiterMemory>();

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
  if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    const isCsrfProtectedPage = csrfPathnameRegex.test(req.nextUrl.pathname);

    if (isCsrfProtectedPage) {
      const csrfToken = req.headers.get('x-csrf-token');
      const storedToken = req.cookies.get('csrf-token')?.value;

      if (!csrfToken || !storedToken || csrfToken !== storedToken) {
        return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 });
      }
    }
  }
  return undefined;
}

/**
 * Checks if the request exceeds rate limits
 * @param req NextRequest object
 * @returns Response if rate limit exceeded, undefined otherwise
 */
async function checkRateLimit(req: NextRequest): Promise<Response | NextResponse | undefined> {
  // Only check API routes
  if (!req.nextUrl.pathname.startsWith('/api')) {
    return undefined;
  }

  const matchingPath = rateLimitedPaths.find((path) => req.nextUrl.pathname.startsWith(path));

  if (!matchingPath) {
    return undefined;
  }

  const rateLimiterKey = matchingPath;

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
  response.headers.set('Cross-Origin-Resource-Policy', 'same-site');
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  response.headers.set('Referrer-Policy', 'no-referrer');
  response.headers.set('X-XSS-Protection', '1; mode=block');

  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  return response;
}

export default auth(async (req: NextAuthRequest) => {
  let response: Response | NextResponse;

  // Check CSRF protection first
  const csrfResult = validateCsrf(req);
  if (csrfResult) {
    return applySecurityHeaders(csrfResult);
  }

  const rateLimitResult = await checkRateLimit(req);
  if (rateLimitResult) {
    return applySecurityHeaders(rateLimitResult);
  }

  if (!req.auth?.user) {
    const isSecuredPage = securedPathnameRegex.test(req.nextUrl.pathname);
    if (isSecuredPage) {
      response = Response.redirect(new URL('/login', req.url));
      return applySecurityHeaders(response);
    }
  }

  response = intlMiddleware(req);
  return applySecurityHeaders(response);
});

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
