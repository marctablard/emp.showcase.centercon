import type { NextRequest } from 'next/server';
import { createSiteMiddleware, resolveSite } from '@/site/middleware';
import type { SiteRoutingConfig } from '@/site/types';
import { resolveApplicableRouting, shouldPrefix } from '@/site/utils';

jest.mock('next-intl/middleware', () => {
  const { NextResponse } = require('next/server');
  return {
    __esModule: true,
    default: () => (req: { headers: Headers; url: string }) => {
      const mode = req.headers.get('x-intl-mode');
      const localeHeader = 'x-middleware-request-x-next-intl-locale';

      if (mode === 'redirect') {
        const res = NextResponse.redirect(new URL('/en', req.url));
        res.headers.set(localeHeader, 'en');
        return res;
      }

      if (mode === 'rewrite') {
        const res = NextResponse.rewrite(new URL('/en', req.url));
        res.headers.set(localeHeader, 'en');
        return res;
      }

      const res = NextResponse.next();
      res.headers.set(localeHeader, 'en');
      return res;
    },
  };
});

jest.mock('@/i18n/routing', () => ({
  routing: {
    locales: ['en'],
    defaultLocale: 'en',
    localePrefix: 'as-needed',
    localeCookie: { name: 'NEXT_LOCALE' },
  },
}));

const createCookies = (values: Record<string, string>) =>
  ({
    get: (name: string) => (values[name] ? { value: values[name] } : undefined),
  }) as unknown as { get: (name: string) => { value: string } | undefined };

const createRequest = (url: string, cookies: Record<string, string> = {}, headers: Record<string, string> = {}) => {
  const nextUrl = new URL(url);
  return {
    url: nextUrl.toString(),
    nextUrl,
    headers: new Headers(headers),
    cookies: createCookies(cookies),
  } as unknown as NextRequest;
};

describe('site middleware - domain and prefix handling', () => {
  const baseRouting: SiteRoutingConfig = {
    defaultSite: 'main',
    availableSites: ['main', 'tenant1', 'tenant2'],
    prefix: 'as-needed',
    cookie: { name: 'NEXT_SITE' },
    header: 'x-emp-site',
    domains: [
      {
        domain: 'shop.pl',
        defaultSite: 'tenant2',
        availableSites: ['tenant2', 'main'],
        prefix: 'as-needed',
      },
    ],
  };

  test('resolves routing by hostname and preserves cookie config', () => {
    const routing = resolveApplicableRouting('shop.pl', baseRouting);

    expect(routing.defaultSite).toBe('tenant2');
    expect(routing.availableSites).toEqual(['tenant2', 'main']);
    expect(routing.cookie?.name).toBe('NEXT_SITE');
  });

  test('falls back to base routing when hostname does not match', () => {
    const routing = resolveApplicableRouting('unknown.example', baseRouting);

    expect(routing.defaultSite).toBe('main');
    expect(routing.availableSites).toEqual(['main', 'tenant1', 'tenant2']);
  });

  test('resolves site from path segment before cookie/header', () => {
    const headers = new Headers();
    const cookies = createCookies({ NEXT_SITE: 'tenant2' }) as unknown as NextRequest['cookies'];
    const result = resolveSite('/tenant1/en/products', cookies, headers, baseRouting);

    expect(result.site).toBe('tenant1');
    expect(result.appPath).toBe('en/products');
  });

  test('ignores site from cookie when no path segment is present (cookieOverridesDefault not set)', () => {
    const headers = new Headers();
    const cookies = createCookies({ NEXT_SITE: 'tenant2' }) as unknown as NextRequest['cookies'];
    const result = resolveSite('/en/products', cookies, headers, baseRouting);

    expect(result.site).toBe('main');
    expect(result.appPath).toBe('en/products');
  });

  test('resolves site from header when cookie is missing', () => {
    const headers = new Headers({ 'x-emp-site': 'tenant1' });
    const cookies = createCookies({}) as unknown as NextRequest['cookies'];
    const result = resolveSite('/en/products', cookies, headers, baseRouting);

    expect(result.site).toBe('tenant1');
    expect(result.appPath).toBe('en/products');
  });

  test('falls back to default site when no hints are present', () => {
    const headers = new Headers();
    const cookies = createCookies({}) as unknown as NextRequest['cookies'];
    const result = resolveSite('/en/products', cookies, headers, baseRouting);

    expect(result.site).toBe('main');
    expect(result.appPath).toBe('en/products');
  });

  test('shouldPrefix respects prefix modes', () => {
    expect(shouldPrefix('main', baseRouting)).toBe(false);
    expect(shouldPrefix('tenant1', baseRouting)).toBe(true);

    expect(shouldPrefix('main', { ...baseRouting, prefix: 'always' })).toBe(true);
    expect(shouldPrefix('tenant1', { ...baseRouting, prefix: 'never' })).toBe(false);
  });
});

describe('domain-only entry mapping', () => {
  const routingConfig: SiteRoutingConfig = {
    defaultSite: 'de',
    availableSites: ['de', 'en'],
    prefix: 'as-needed',
    cookie: { name: 'NEXT_SITE' },
    domains: [
      {
        domain: 'example.de',
        defaultSite: 'de',
        availableSites: ['de', 'en'],
        prefix: 'as-needed',
      },
      {
        domain: 'example.en',
        defaultSite: 'en',
        availableSites: ['de', 'en'],
        prefix: 'as-needed',
      },
      {
        domain: 'example.com',
        defaultSite: 'de',
        availableSites: ['de', 'en'],
        prefix: 'as-needed',
      },
    ],
  };

  test('https://example.de maps to site de', () => {
    const routing = resolveApplicableRouting('example.de', routingConfig);
    const result = resolveSite('/', createCookies({}) as unknown as NextRequest['cookies'], new Headers(), routing);

    expect(result.site).toBe('de');
  });

  test('https://example.en maps to site en', () => {
    const routing = resolveApplicableRouting('example.en', routingConfig);
    const result = resolveSite('/', createCookies({}) as unknown as NextRequest['cookies'], new Headers(), routing);

    expect(result.site).toBe('en');
  });

  test('https://example.com maps to site de (default)', () => {
    const routing = resolveApplicableRouting('example.com', routingConfig);
    const result = resolveSite('/', createCookies({}) as unknown as NextRequest['cookies'], new Headers(), routing);

    expect(result.site).toBe('de');
  });
});

describe('createSiteMiddleware redirect/rewrite behavior', () => {
  const routingConfig: SiteRoutingConfig = {
    defaultSite: 'main',
    availableSites: ['main', 'tenant1'],
    prefix: 'as-needed',
    cookie: { name: 'NEXT_SITE' },
    cookieOverridesDefault: true,
  };

  test('redirects to include site when prefix is required', () => {
    const middleware = createSiteMiddleware(routingConfig);
    const req = createRequest('https://example.com/en/products', { NEXT_SITE: 'tenant1' });
    const response = middleware(req);

    expect(response?.headers.get('location')).toBe('https://example.com/tenant1/en/products');
  });

  test('redirects to remove site when prefix is not needed', () => {
    const middleware = createSiteMiddleware(routingConfig);
    const req = createRequest('https://example.com/main/en/products', { NEXT_SITE: 'main' });
    const response = middleware(req);

    expect(response?.headers.get('location')).toBe('https://example.com/en/products');
  });

  test('rewrites to include default site when prefix is not needed', () => {
    const middleware = createSiteMiddleware(routingConfig);
    const req = createRequest('https://example.com/en/products', { NEXT_SITE: 'main' });
    const response = middleware(req);

    expect(response?.headers.get('x-middleware-rewrite')).toBe('https://example.com/main/en/products');
  });

  test('prepends site to intl redirect when prefix is required', () => {
    const middleware = createSiteMiddleware(routingConfig);
    const req = createRequest('https://example.com/en', { NEXT_SITE: 'tenant1' }, { 'x-intl-mode': 'redirect' });
    const response = middleware(req);

    expect(response?.headers.get('location')).toBe('https://example.com/tenant1/en');
  });
});
