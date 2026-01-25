import { LocalePrefixMode } from 'next-intl/routing';

// this is used to memorize the site in the middleware
export const INTERNAL_SITE_HEADER = 'x-request-emp-site';
export const INTERNAL_APP_PATH_HEADER = 'x-request-emp-app-path';
// this is used to memorize the rewrite in the middleware (just a redeclaration of the NextJS header)
export const NEXT_REWRITE_HEADER = 'x-middleware-rewrite';

// for convenience we imitate LocalePrefixMode
export type SitePrefixMode = LocalePrefixMode;

export type SiteConfig = {
  defaultSite: string;
  availableSites: string[];
  prefix: SitePrefixMode;
  header?: string;
  cookie?: { name: string; maxAge?: number };
};

export type SiteDomainConfig = Omit<SiteConfig, 'cookie'> & {
  domain: string | RegExp;
};

export type SiteRoutingConfig = SiteConfig & {
  domains?: SiteDomainConfig[];
};
