/**
 * Centralized Site & Deployment Configuration
 * Single source of truth for canonical base URLs, environment origin overrides,
 * brand metadata, and verified contact channels across SSR, client components,
 * SEO metadata, JSON-LD structured data, sitemaps, and robots directives.
 */

export interface SiteConfig {
  readonly name: string;
  readonly legalName: string;
  readonly tagline: string;
  readonly defaultBaseUrl: string;
  readonly contactEmail: string;
  readonly securityEmail: string;
  readonly privacyEmail: string;
  readonly accessibilityEmail: string;
  readonly whatsappNumber: string;
  readonly ogImagePath: string;
  readonly logoPath: string;
  readonly addressLocality: string;
  readonly addressCountry: string;
}

export const DEFAULT_FALLBACK_BASE_URL = 'https://company-os-3ox.pages.dev';

export function normalizeBaseUrl(raw?: string | null): string | undefined {
  if (!raw || typeof raw !== 'string') return undefined;
  const trimmed = raw.trim().replace(/\/+$/, '');
  if (!trimmed || trimmed === 'null' || trimmed === 'undefined') return undefined;
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return undefined;
    }
    return parsed.origin;
  } catch {
    return undefined;
  }
}

export function isLoopbackOrigin(origin?: string): boolean {
  if (!origin) return false;
  return (
    origin.includes('localhost') ||
    origin.includes('127.0.0.1') ||
    origin.includes('0.0.0.0') ||
    origin.includes('[::1]')
  );
}

function readEnvBaseUrl(): string | undefined {
  const metaEnv =
    typeof import.meta !== 'undefined'
      ? (import.meta as { env?: Record<string, string | undefined> }).env
      : undefined;
  const nodeEnv =
    typeof process !== 'undefined' && process.env ? process.env : undefined;

  const candidates = [
    metaEnv?.PUBLIC_SITE_URL,
    metaEnv?.SITE_URL,
    metaEnv?.CF_PAGES_URL,
    nodeEnv?.PUBLIC_SITE_URL,
    nodeEnv?.SITE_URL,
    nodeEnv?.CF_PAGES_URL,
  ];

  for (const candidate of candidates) {
    const normalized = normalizeBaseUrl(candidate);
    if (normalized) return normalized;
  }
  return undefined;
}

export const siteConfig: SiteConfig = {
  name: 'EULOK',
  legalName: 'EULOK Software Engineering',
  tagline: 'Independent software engineering for Uganda and worldwide.',
  defaultBaseUrl: readEnvBaseUrl() || DEFAULT_FALLBACK_BASE_URL,
  contactEmail: 'hello@eulok.com',
  securityEmail: 'security@eulok.com',
  privacyEmail: 'privacy@eulok.com',
  accessibilityEmail: 'accessibility@eulok.com',
  whatsappNumber: '256760779160',
  ogImagePath: '/og-image.png',
  logoPath: '/logo.png',
  addressLocality: 'Kampala',
  addressCountry: 'UG',
};

/**
 * Resolves the active base URL cleanly.
 * Priority: explicit valid customOrigin -> env config (PUBLIC_SITE_URL / SITE_URL / CF_PAGES_URL)
 * -> non-loopback browser origin -> siteConfig.defaultBaseUrl.
 */
export function resolveSiteBaseUrl(customOrigin?: string): string {
  const explicit = normalizeBaseUrl(customOrigin);
  if (explicit) return explicit;

  const envUrl = readEnvBaseUrl();
  if (envUrl) return envUrl;

  if (typeof window !== 'undefined' && window.location?.origin) {
    const browserOrigin = normalizeBaseUrl(window.location.origin);
    if (browserOrigin && !isLoopbackOrigin(browserOrigin)) {
      return browserOrigin;
    }
  }

  return siteConfig.defaultBaseUrl;
}

/**
 * Resolves a path (e.g. '/services') against the active base URL.
 */
export function resolveSiteUrl(path = '/', customOrigin?: string): string {
  const base = resolveSiteBaseUrl(customOrigin);
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  try {
    return new URL(cleanPath, base).href;
  } catch {
    return `${base}${cleanPath}`;
  }
}
