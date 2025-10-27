import createIntlMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from '@/i18n/routing';
import type { SiteConfig, SiteRoutingConfig } from '@/site/types';

export function resolveSite(
  pathname: string,
  cookies: NextRequest['cookies'],
  headers: NextRequest['headers'],
  routing: SiteConfig,
): { site: string; appPath: string } {
  const segments = pathname.replace('/', '').split('/');
  let site: string | null = null;
  // first, try to resolve the site from the first path-segment
  if (routing.availableSites.includes(segments[0])) {
    site = segments[0];
    segments.shift();
  }
  // second, try to look for an existing site-cookie
  if (!site && routing.cookie) {
    site = cookies.get(routing.cookie)?.value || null;
  }
  // third, try to look for an existing site-header
  if (!site && routing.header) {
    site = headers.get(routing.header);
  }
  // fourth, use the default site
  if (!site) {
    site = routing.defaultSite;
  }
  return { site, appPath: segments.join('/') };
}

export function resolveApplicableRouting(hostname: string, routing: SiteRoutingConfig): SiteConfig {
  if (!routing.domains) {
    return routing;
  }
  const domainRouting = routing.domains.find((domain) =>
    domain.domain instanceof RegExp ? domain.domain.test(hostname) : domain.domain === hostname,
  );
  return domainRouting || routing;
}

const intlMiddleware = createIntlMiddleware(routing);

export function createSiteMiddleware(routingConfig: SiteRoutingConfig) {
  return (req: NextRequest) => {
    // First look for the matching routing by Domain
    const routing = resolveApplicableRouting(req.nextUrl.hostname, routingConfig);
    const { site, appPath } = resolveSite(req.nextUrl.pathname, req.cookies, req.headers, routing);
    // no routing desired or it's the defaultSite and not needed
    if (routing.prefix === 'never' || (site == routing.defaultSite && routing.prefix === 'as-needed')) {
      // we need to redirect if site is part of the actual path,
      // since it's either not desired or not needed
      if (req.nextUrl.pathname.startsWith(`/${site}`)) {
        console.debug('redirecting to appPath, because the site should not be supplied', `/${appPath}`);
        const redirectUrl = new URL(`/${appPath}`, req.url);
        redirectUrl.search = req.nextUrl.search;
        return NextResponse.redirect(redirectUrl);
      }
      // url-path does not start with the site, routing is either always or 'as-needed' and not default site
    } else if (!req.nextUrl.pathname.startsWith(`/${site}`)) {
      console.debug(
        'redirecting to appPath, because the site should be supplied (always, or not default site)',
        `/${site}/${appPath}`,
      );
      const redirectUrl = new URL(`/${site}/${appPath}`, req.url);
      redirectUrl.search = req.nextUrl.search;
      return NextResponse.redirect(redirectUrl);
    }
    // fake a reduced path for the intlMiddleware
    req.nextUrl.pathname = appPath;
    const response = intlMiddleware(req);
    // we need to modify the returned response from intl Middleware to include our site (if necessary)
    if (response.status === 307) {
      const location = new URL(response.headers.get('location') || '', req.url);
      location.pathname = `/${site}${location.pathname == '/' ? '' : location.pathname}`;
      // Preserve query parameters from the original request if not already present
      if (!location.search && req.nextUrl.search) {
        location.search = req.nextUrl.search;
      }
      response.headers.set('location', location.toString());
    } else {
      const location = new URL(response.headers.get('x-middleware-rewrite') || '', req.url);
      location.pathname = `/${site}${location.pathname == '/' ? '' : location.pathname}`;
      response.headers.set('x-request-emp-site', site);
      response.headers.set('x-middleware-rewrite', location.toString());
    }
    return response;
  };
}
