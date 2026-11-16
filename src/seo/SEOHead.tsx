import React from 'react';
import { useSEO } from './useSEO.ts';
import { resolveSiteBaseUrl } from '../siteConfig.ts';

interface SEOHeadProps {
  pageId: string;
  customOrigin?: string;
}

/**
 * Headless declarative component for syncing SEO metadata based on current active page.
 */
export const SEOHead: React.FC<SEOHeadProps> = ({ pageId, customOrigin }) => {
  const effectiveOrigin = customOrigin ?? resolveSiteBaseUrl();
  useSEO(pageId, effectiveOrigin);
  return null;
};
