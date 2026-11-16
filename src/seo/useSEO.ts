import { useEffect } from 'react';
import { getPageSEO } from './seoConfig.ts';
import { applySEOToHead } from './seoManager.ts';
import type { PageSEOConfig } from './types.ts';
import { resolveSiteBaseUrl } from '../siteConfig.ts';

/**
 * React hook to synchronize document head SEO metadata on route/page transition.
 */
export function useSEO(pageId: string, customOrigin?: string): PageSEOConfig {
  const config = getPageSEO(pageId);
  const resolvedOrigin = customOrigin ?? resolveSiteBaseUrl();

  useEffect(() => {
    applySEOToHead(config, resolvedOrigin);
  }, [config, resolvedOrigin]);

  return config;
}
