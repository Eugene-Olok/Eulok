import type { APIRoute } from 'astro';
import { isLoopbackOrigin, resolveSiteBaseUrl, resolveSiteUrl } from '../siteConfig.ts';

export const GET: APIRoute = ({ site, url }) => {
  const candidateOrigin = site?.origin || url?.origin;
  const activeOrigin =
    candidateOrigin && !isLoopbackOrigin(candidateOrigin)
      ? resolveSiteBaseUrl(candidateOrigin)
      : resolveSiteBaseUrl();

  const sitemapUrl = resolveSiteUrl('/sitemap.xml', activeOrigin);
  const body = [
    '# EULOK robots.txt',
    `# ${resolveSiteUrl('/robots.txt', activeOrigin)}`,
    '',
    'User-agent: *',
    'Allow: /',
    '',
    '# Canonical XML Sitemap',
    `Sitemap: ${sitemapUrl}`,
    '',
    '# Crawl-delay for polite indexation',
    'Crawl-delay: 5',
    '',
  ].join('\n');

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
};
