import type { PageSEOConfig } from './types.ts';
import { SITE_NAME, SITE_URL, DEFAULT_OG_IMAGE } from './seoConfig.ts';

export interface MetaTagEntry {
  attributeName: 'name' | 'property';
  attributeValue: string;
  content: string;
}

/**
 * Resolves a fully qualified canonical URL based on origin and path.
 */
export function resolveCanonicalUrl(path: string, customOrigin?: string): string {
  const origin =
    customOrigin ||
    (typeof window !== 'undefined' && window.location?.origin
      ? window.location.origin
      : SITE_URL);

  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  try {
    return new URL(cleanPath, origin).href;
  } catch {
    return `${origin}${cleanPath}`;
  }
}

/**
 * Computes the complete dictionary of meta and link tags for a given configuration.
 */
export function buildSEOTags(
  config: PageSEOConfig,
  customOrigin?: string
): {
  title: string;
  canonicalUrl: string;
  metaTags: MetaTagEntry[];
  jsonLd: string;
} {
  const canonicalUrl = resolveCanonicalUrl(config.canonicalPath, customOrigin);
  const ogImage = config.ogImage || DEFAULT_OG_IMAGE;
  const ogImageAlt = config.ogImageAlt || config.title;

  const metaTags: MetaTagEntry[] = [
    { attributeName: 'name', attributeValue: 'description', content: config.description },
    {
      attributeName: 'name',
      attributeValue: 'keywords',
      content: config.keywords.join(', '),
    },
    { attributeName: 'name', attributeValue: 'robots', content: config.robots || 'index, follow' },

    // OpenGraph
    { attributeName: 'property', attributeValue: 'og:title', content: config.title },
    {
      attributeName: 'property',
      attributeValue: 'og:description',
      content: config.description,
    },
    { attributeName: 'property', attributeValue: 'og:type', content: config.ogType },
    { attributeName: 'property', attributeValue: 'og:url', content: canonicalUrl },
    { attributeName: 'property', attributeValue: 'og:site_name', content: SITE_NAME },
    { attributeName: 'property', attributeValue: 'og:image', content: ogImage },
    { attributeName: 'property', attributeValue: 'og:image:alt', content: ogImageAlt },

    // Twitter
    { attributeName: 'name', attributeValue: 'twitter:card', content: config.twitterCard },
    { attributeName: 'name', attributeValue: 'twitter:title', content: config.title },
    {
      attributeName: 'name',
      attributeValue: 'twitter:description',
      content: config.description,
    },
    { attributeName: 'name', attributeValue: 'twitter:image', content: ogImage },
  ];

  const jsonLd = JSON.stringify(config.structuredData, null, 2);

  return {
    title: config.title,
    canonicalUrl,
    metaTags,
    jsonLd,
  };
}

const JSON_LD_SCRIPT_ID = 'eulok-seo-jsonld';
const CANONICAL_LINK_ID = 'eulok-canonical-link';

/**
 * Deterministically applies SEO metadata into the document <head>.
 * Safely handles tag reuse, avoiding DOM element pollution or memory leaks.
 */
export function applySEOToHead(config: PageSEOConfig, customOrigin?: string): void {
  if (typeof document === 'undefined') {
    return;
  }

  const { title, canonicalUrl, metaTags, jsonLd } = buildSEOTags(config, customOrigin);

  // 1. Title
  document.title = title;

  // 2. Canonical Link
  let canonicalEl = document.getElementById(CANONICAL_LINK_ID) as HTMLLinkElement | null;
  if (!canonicalEl) {
    canonicalEl = document.querySelector('link[rel="canonical"]');
  }
  if (!canonicalEl) {
    canonicalEl = document.createElement('link');
    canonicalEl.setAttribute('rel', 'canonical');
    canonicalEl.id = CANONICAL_LINK_ID;
    document.head.appendChild(canonicalEl);
  }
  canonicalEl.setAttribute('href', canonicalUrl);

  // 3. Meta Tags
  for (const tag of metaTags) {
    const selector = `meta[${tag.attributeName}="${tag.attributeValue}"]`;
    let metaEl = document.querySelector(selector) as HTMLMetaElement | null;
    if (!metaEl) {
      metaEl = document.createElement('meta');
      metaEl.setAttribute(tag.attributeName, tag.attributeValue);
      document.head.appendChild(metaEl);
    }
    metaEl.setAttribute('content', tag.content);
  }

  // 4. Schema.org JSON-LD Script
  let scriptEl = document.getElementById(JSON_LD_SCRIPT_ID) as HTMLScriptElement | null;
  if (!scriptEl) {
    scriptEl = document.querySelector('script[type="application/ld+json"]');
  }
  if (!scriptEl) {
    scriptEl = document.createElement('script');
    scriptEl.type = 'application/ld+json';
    scriptEl.id = JSON_LD_SCRIPT_ID;
    document.head.appendChild(scriptEl);
  } else {
    scriptEl.id = JSON_LD_SCRIPT_ID;
  }
  scriptEl.textContent = jsonLd;

  // 5. Notify any listeners (telemetry, devtools, analytics)
  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
    try {
      window.dispatchEvent(
        new CustomEvent('eulok:seo-updated', {
          detail: {
            pageId: config.pageId,
            title,
            canonicalUrl,
          },
        })
      );
    } catch {
      // Ignore if event dispatch fails in restricted environments
    }
  }
}
