import { useEffect } from 'react';
import { getPageSEO } from './seoConfig.ts';
import { applySEOToHead } from './seoManager.ts';
import type { PageSEOConfig } from './types.ts';

/**
 * React hook to synchronize document head SEO metadata on route/page transition.
 */
export function useSEO(pageId: string, customOrigin?: string): PageSEOConfig {
  const config = getPageSEO(pageId);

  useEffect(() => {
    applySEOToHead(config, customOrigin);
  }, [config, customOrigin]);

  return config;
}
