import { cache } from 'react';
import { headers } from 'next/headers';
import { getServerLogger } from '@/lib/logger/server-logger';
import { INTERNAL_SITE_HEADER } from '../types';
import { getCachedRequestSite } from './RequestSiteCache';

async function getSiteFromHeaderImpl(): Promise<string> {
  let site;

  try {
    site = (await headers()).get(INTERNAL_SITE_HEADER) || undefined;
    getServerLogger().debug({ site }, 'Request site resolved');
  } catch (error) {
    getServerLogger().error({ err: error }, 'Error getting headers');
  }

  return site || 'main';
}
const getSiteFromHeader = cache(getSiteFromHeaderImpl);

export async function getRequestSite() {
  return getCachedRequestSite() || (await getSiteFromHeader());
}
