import React from 'react';
import { useSEO } from './useSEO.ts';

interface SEOHeadProps {
  pageId: string;
  customOrigin?: string;
}

/**
 * Headless declarative component for syncing SEO metadata based on current active page.
 */
export const SEOHead: React.FC<SEOHeadProps> = ({ pageId, customOrigin }) => {
  useSEO(pageId, customOrigin);
  return null;
};
