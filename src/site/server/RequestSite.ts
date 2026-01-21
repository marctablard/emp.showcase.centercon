import { cache } from 'react';
import { headers } from 'next/headers';
import server from '@/platform/server';
import type { LoggerService } from '@/platform/services/logger/LoggerService';
import { INTERNAL_SITE_HEADER } from '../types';
import { getCachedRequestSite } from './RequestSiteCache';

async function getSiteFromHeaderImpl(): Promise<string> {
  let site;

  try {
    site = (await headers()).get(INTERNAL_SITE_HEADER) || undefined;
    server.get<LoggerService>('LoggerService').debug({ site }, 'Request site resolved');
  } catch (error) {
    server.get<LoggerService>('LoggerService').error({ err: error }, 'Error getting headers');
  }

  return site || 'main';
}
const getSiteFromHeader = cache(getSiteFromHeaderImpl);

export async function getRequestSite() {
  return getCachedRequestSite() || (await getSiteFromHeader());
}
