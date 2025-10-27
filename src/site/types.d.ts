import { LocalePrefixMode } from 'next-intl/routing';

// for convenience we imitate LocalePrefixMode
export type SitePrefixMode = LocalePrefixMode;

export type SiteConfig = {
  defaultSite: string;
  availableSites: string[];
  prefix: SitePrefixMode;
  header?: string;
  cookie?: string;
};

export type SiteDomainConfig = SiteConfig & {
  domain: string | RegExp;
};

export type SiteRoutingConfig = SiteConfig & {
  domains: SiteDomainConfig[];
};
