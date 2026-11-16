import type { APIRoute } from 'astro';
import { SEO_PAGE_CONFIGS } from '../seo/seoConfig.ts';
import { isLoopbackOrigin, resolveSiteBaseUrl, resolveSiteUrl } from '../siteConfig.ts';

const ROUTE_PRIORITY: Record<string, { changefreq: string; priority: string }> = {
  home: { changefreq: 'weekly', priority: '1.0' },
  services: { changefreq: 'weekly', priority: '0.9' },
  'services/reconciliation': { changefreq: 'weekly', priority: '0.9' },
  'ops-suite': { changefreq: 'weekly', priority: '0.9' },
  'services/finance-integrations': { changefreq: 'weekly', priority: '0.85' },
  'services/performance-builds': { changefreq: 'weekly', priority: '0.85' },
  rescue: { changefreq: 'weekly', priority: '0.85' },
  contact: { changefreq: 'monthly', priority: '0.85' },
  'scope-calculator': { changefreq: 'weekly', priority: '0.85' },
  work: { changefreq: 'weekly', priority: '0.8' },
  'case-studies': { changefreq: 'weekly', priority: '0.8' },
  status: { changefreq: 'daily', priority: '0.8' },
  insights: { changefreq: 'weekly', priority: '0.75' },
  verification: { changefreq: 'weekly', priority: '0.75' },
  about: { changefreq: 'monthly', priority: '0.7' },
  standards: { changefreq: 'monthly', priority: '0.65' },
  security: { changefreq: 'monthly', priority: '0.65' },
  privacy: { changefreq: 'monthly', priority: '0.65' },
  accessibility: { changefreq: 'monthly', priority: '0.6' },
};

export const GET: APIRoute = ({ site, url }) => {
  const candidateOrigin = site?.origin || url?.origin;
  const activeOrigin =
    candidateOrigin && !isLoopbackOrigin(candidateOrigin)
      ? resolveSiteBaseUrl(candidateOrigin)
      : resolveSiteBaseUrl();

  const lastmod = '2026-11-16';
  const urls = Object.values(SEO_PAGE_CONFIGS)
    .filter((cfg) => cfg.pageId !== 'notFound')
    .map((cfg) => {
      const meta = ROUTE_PRIORITY[cfg.pageId] || { changefreq: 'monthly', priority: '0.7' };
      const loc = resolveSiteUrl(cfg.canonicalPath, activeOrigin);
      return [
        '  <url>',
        `    <loc>${loc}</loc>`,
        `    <lastmod>${lastmod}</lastmod>`,
        `    <changefreq>${meta.changefreq}</changefreq>`,
        `    <priority>${meta.priority}</priority>`,
        '  </url>',
      ].join('\n');
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
};
