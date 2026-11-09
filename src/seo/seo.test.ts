import test from 'node:test';
import assert from 'node:assert/strict';
import {
  SEO_PAGE_CONFIGS,
  getPageSEO,
  SITE_NAME,
  SITE_URL,
} from './seoConfig.ts';
import {
  resolveCanonicalUrl,
  buildSEOTags,
  applySEOToHead,
} from './seoManager.ts';

test('SEO Config — Complete route coverage', () => {
  const expectedRoutes = [
    'home',
    'services',
    'services/performance-builds',
    'services/finance-integrations',
    'services/reconciliation',
    'rescue',
    'work',
    'case-studies',
    'insights',
    'verification',
    'about',
    'contact',
    'standards',
    'security',
    'privacy',
    'accessibility',
    'ops-suite',
    'scope-calculator',
    'status',
  ];

  for (const route of expectedRoutes) {
    const config = SEO_PAGE_CONFIGS[route];
    assert.ok(config, `Expected route "${route}" to be defined in SEO_PAGE_CONFIGS`);
    assert.equal(config.pageId, route);
  }
});

test('SEO Guidelines — Title length between 30 and 60 chars & branded', () => {
  for (const [route, config] of Object.entries(SEO_PAGE_CONFIGS)) {
    const titleLen = config.title.length;
    assert.ok(
      titleLen >= 30 && titleLen <= 60,
      `Route "${route}" title "${config.title}" has length ${titleLen}, must be between 30 and 60 chars`
    );
    assert.ok(
      config.title.includes(SITE_NAME),
      `Route "${route}" title must contain brand "${SITE_NAME}"`
    );
  }
});

test('SEO Guidelines — Meta description length between 120 and 160 chars', () => {
  for (const [route, config] of Object.entries(SEO_PAGE_CONFIGS)) {
    const descLen = config.description.length;
    assert.ok(
      descLen >= 120 && descLen <= 160,
      `Route "${route}" description "${config.description}" has length ${descLen}, must be between 120 and 160 chars`
    );
  }
});

test('SEO Guidelines — No generic placeholders or slop', () => {
  const forbiddenPatterns = [/vite app/i, /react app/i, /my application/i, /todo/i, /untitled/i];

  for (const [route, config] of Object.entries(SEO_PAGE_CONFIGS)) {
    for (const pattern of forbiddenPatterns) {
      assert.ok(!pattern.test(config.title), `Route "${route}" title contains forbidden placeholder`);
      assert.ok(!pattern.test(config.description), `Route "${route}" description contains forbidden placeholder`);
    }
  }
});

test('SEO Manager — resolveCanonicalUrl', () => {
  const url1 = resolveCanonicalUrl('/', 'https://eulok.com');
  assert.equal(url1, 'https://eulok.com/');

  const url2 = resolveCanonicalUrl('services/reconciliation', 'https://eulok.com');
  assert.equal(url2, 'https://eulok.com/services/reconciliation');

  const url3 = resolveCanonicalUrl('/ops-suite', 'https://example.org');
  assert.equal(url3, 'https://example.org/ops-suite');
});

test('SEO Manager — buildSEOTags generates all required social cards and structured data', () => {
  const config = SEO_PAGE_CONFIGS['services/reconciliation'];
  const tags = buildSEOTags(config, SITE_URL);

  assert.equal(tags.title, config.title);
  assert.equal(tags.canonicalUrl, 'https://eulok.com/services/reconciliation');

  const metaMap = new Map<string, string>();
  for (const m of tags.metaTags) {
    metaMap.set(`${m.attributeName}:${m.attributeValue}`, m.content);
  }

  // Standard SEO
  assert.equal(metaMap.get('name:description'), config.description);
  assert.ok(metaMap.get('name:keywords')?.includes('deterministic reconciliation'));
  assert.equal(metaMap.get('name:robots'), 'index, follow');

  // OpenGraph
  assert.equal(metaMap.get('property:og:title'), config.title);
  assert.equal(metaMap.get('property:og:description'), config.description);
  assert.equal(metaMap.get('property:og:type'), 'website');
  assert.equal(metaMap.get('property:og:url'), 'https://eulok.com/services/reconciliation');
  assert.equal(metaMap.get('property:og:site_name'), SITE_NAME);
  assert.ok(metaMap.get('property:og:image'));
  assert.ok(metaMap.get('property:og:image:alt'));

  // Twitter
  assert.equal(metaMap.get('name:twitter:card'), 'summary_large_image');
  assert.equal(metaMap.get('name:twitter:title'), config.title);
  assert.equal(metaMap.get('name:twitter:description'), config.description);
  assert.ok(metaMap.get('name:twitter:image'));

  // JSON-LD valid parseable schema
  const parsedJson = JSON.parse(tags.jsonLd);
  assert.equal(parsedJson['@context'], 'https://schema.org');
  assert.equal(parsedJson['@type'], 'SoftwareApplication');
  assert.equal(parsedJson['name'], 'EULOK Deterministic Reconciliation Engine');
});

test('SEO Config — getPageSEO fallback on unknown routes', () => {
  const unknown = getPageSEO('some/unknown/page');
  assert.equal(unknown.pageId, 'some/unknown/page');
  assert.equal(unknown.canonicalPath, '/some/unknown/page');
  assert.equal(unknown.title, SEO_PAGE_CONFIGS.home.title);
});

test('SEO DOM — applySEOToHead safely runs in non-browser or browser environment', () => {
  // In node environment without global document, should not throw
  assert.doesNotThrow(() => {
    applySEOToHead(SEO_PAGE_CONFIGS.home);
  });
});
