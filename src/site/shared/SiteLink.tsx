'use client';

import { cloneElement, isValidElement } from 'react';
import { SiteRoutingConfig } from '@/site/types';
import { addPrefixIfNeeded } from '@/site/utils';

interface SiteLinkProps extends React.ComponentProps<any> {
  site?: string;
  I18nLink: React.ComponentType<any>;
  getSite: () => string;
  siteRouting: SiteRoutingConfig;
}

export function SiteLink({ site, I18nLink, getSite, siteRouting, ...props }: SiteLinkProps) {
  const i18nLinkElement = <I18nLink {...props} />;

  if (isValidElement(i18nLinkElement)) {
    const linkProps = i18nLinkElement.props as React.ComponentProps<typeof I18nLink>;
    const originalHref = linkProps.href;
    const prefixSite = site ?? getSite();
    const modifiedHref = addPrefixIfNeeded(
      typeof originalHref === 'string' ? originalHref : originalHref?.pathname || '',
      prefixSite,
      siteRouting,
    );
    return cloneElement(i18nLinkElement, {
      ...linkProps,
      href: modifiedHref,
    } as React.ComponentProps<typeof I18nLink>);
  }

  return i18nLinkElement;
}
