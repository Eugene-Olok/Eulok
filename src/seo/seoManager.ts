import type { PageSEOConfig } from './types.ts';
import { SITE_NAME, SITE_URL, DEFAULT_OG_IMAGE } from './seoConfig.ts';
import { siteConfig, resolveSiteBaseUrl, resolveSiteUrl } from '../siteConfig.ts';

export interface MetaTagEntry {
  attributeName: 'name' | 'property';
  attributeValue: string;
  content: string;
}

/**
 * Resolves a fully qualified canonical URL based on origin and path.
 */
export function resolveCanonicalUrl(path: string, customOrigin?: string): string {
  return resolveSiteUrl(path, customOrigin);
}

/**
 * Recursively rewrites default base URL occurrences inside JSON-LD objects
 * to match the active runtime/build origin.
 */
function rewriteStructuredDataOrigin(value: unknown, activeOrigin: string): unknown {
  if (typeof value === 'string') {
    if (SITE_URL !== activeOrigin && value.startsWith(SITE_URL)) {
      return `${activeOrigin}${value.slice(SITE_URL.length)}`;
    }
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((item) => rewriteStructuredDataOrigin(item, activeOrigin));
  }
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = rewriteStructuredDataOrigin(v, activeOrigin);
    }
    return out;
  }
  return value;
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
  const activeOrigin = resolveSiteBaseUrl(customOrigin);
  const canonicalUrl = resolveCanonicalUrl(config.canonicalPath, activeOrigin);
  const rawOgImage = config.ogImage || DEFAULT_OG_IMAGE;
  const ogImage =
    rawOgImage.startsWith(SITE_URL) && SITE_URL !== activeOrigin
      ? `${activeOrigin}${rawOgImage.slice(SITE_URL.length)}`
      : rawOgImage.startsWith('/')
        ? resolveSiteUrl(rawOgImage, activeOrigin)
        : rawOgImage;
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
    { attributeName: 'property', attributeValue: 'og:site_name', content: SITE_NAME || siteConfig.name },
    { attributeName: 'property', attributeValue: 'og:image', content: ogImage },
    { attributeName: 'property', attributeValue: 'og:image:width', content: '1200' },
    { attributeName: 'property', attributeValue: 'og:image:height', content: '630' },
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

  const localizedStructuredData = rewriteStructuredDataOrigin(config.structuredData, activeOrigin);
  const jsonLd = JSON.stringify(localizedStructuredData, null, 2);

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
