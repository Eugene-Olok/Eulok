import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveBreadcrumbs, PAGE_LABEL_MAP } from './breadcrumbNavigation.ts';

test('Breadcrumb Resolver — Home page with no custom items returns empty list', () => {
  const items = resolveBreadcrumbs('home');
  assert.equal(items.length, 0);
});

test('Breadcrumb Resolver — Direct page generates Home > Page trail', () => {
  const items = resolveBreadcrumbs('case-studies');
  assert.equal(items.length, 2);
  assert.equal(items[0].label, 'Home');
  assert.equal(items[0].page, 'home');
  assert.equal(items[1].label, 'Case Studies & Evidence');
  assert.equal(items[1].page, undefined);
});

test('Breadcrumb Resolver — Nested route generates hierarchical path', () => {
  const items = resolveBreadcrumbs('services/finance-integrations');
  assert.equal(items.length, 3);
  assert.equal(items[0].label, 'Home');
  assert.equal(items[0].page, 'home');
  assert.equal(items[1].label, 'Services');
  assert.equal(items[1].page, 'services');
  assert.equal(items[2].label, 'Finance & EFRIS Integrations');
  assert.equal(items[2].page, undefined);
});

test('Breadcrumb Resolver — Reconciliation detail route', () => {
  const items = resolveBreadcrumbs('services/reconciliation');
  assert.equal(items.length, 3);
  assert.equal(items[0].label, 'Home');
  assert.equal(items[1].label, 'Services');
  assert.equal(items[2].label, 'Deterministic Reconciliation');
});

test('Breadcrumb Resolver — Custom override preserves supplied items', () => {
  const custom = [
    { label: 'Portal', page: 'portal' },
    { label: 'Ledger Audit' },
  ];
  const items = resolveBreadcrumbs('custom-page', custom);
  assert.equal(items.length, 2);
  assert.equal(items[0].label, 'Portal');
  assert.equal(items[1].label, 'Ledger Audit');
});

test('Breadcrumb Mapping — Core routes have human-readable labels', () => {
  const requiredRoutes = [
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
    'scope-calculator',
    'status',
    'about',
    'contact',
    'standards',
    'security',
    'privacy',
    'accessibility',
    'ops-suite',
  ];

  for (const route of requiredRoutes) {
    assert.ok(PAGE_LABEL_MAP[route], `Route ${route} must have a label in PAGE_LABEL_MAP`);
    assert.ok(PAGE_LABEL_MAP[route].length > 0);
  }
});

// Theme Manager Tests
test('Theme Manager — Variable tokens definition and integrity', async () => {
  const { LIGHT_THEME_VARIABLES, DARK_THEME_VARIABLES } = await import('../utils/themeManager.ts');
  assert.ok(LIGHT_THEME_VARIABLES['--bg-primary']);
  assert.ok(LIGHT_THEME_VARIABLES['--text-main']);
  assert.ok(DARK_THEME_VARIABLES['--bg-primary']);
  assert.ok(DARK_THEME_VARIABLES['--text-main']);
  assert.notEqual(LIGHT_THEME_VARIABLES['--bg-primary'], DARK_THEME_VARIABLES['--bg-primary']);
  assert.notEqual(LIGHT_THEME_VARIABLES['--text-main'], DARK_THEME_VARIABLES['--text-main']);
});

test('Theme Manager — Toggle transitions between dark and light', async () => {
  const { toggleTheme } = await import('../utils/themeManager.ts');
  const nextLight = toggleTheme('dark');
  assert.equal(nextLight, 'light');
  const nextDark = toggleTheme('light');
  assert.equal(nextDark, 'dark');
});

// Contact FAQ Search Filter Tests
test('Contact FAQ Filter — Empty query returns all topics', async () => {
  const { filterFaqs, FAQ_ITEMS } = await import('../data/contactFaqs.ts');
  const results = filterFaqs('');
  assert.equal(results.length, FAQ_ITEMS.length);
});

test('Contact FAQ Filter — Query "momo" matches mobile money reconciliation', async () => {
  const { filterFaqs } = await import('../data/contactFaqs.ts');
  const results = filterFaqs('momo');
  assert.ok(results.length > 0);
  assert.ok(results.some((item) => item.id === 'momo-reconciliation'));
});

test('Contact FAQ Filter — Query "efris" matches URA fiscal invoicing', async () => {
  const { filterFaqs } = await import('../data/contactFaqs.ts');
  const results = filterFaqs('efris');
  assert.ok(results.length > 0);
  assert.ok(results.some((item) => item.id === 'efris-integration'));
});

test('Contact FAQ Filter — Category filter limits results accurately', async () => {
  const { filterFaqs } = await import('../data/contactFaqs.ts');
  const securityOnly = filterFaqs('', 'Security & Ownership');
  assert.ok(securityOnly.length > 0);
  for (const item of securityOnly) {
    assert.equal(item.category, 'Security & Ownership');
  }
});

test('Contact FAQ Filter — Non-matching query returns empty array', async () => {
  const { filterFaqs } = await import('../data/contactFaqs.ts');
  const results = filterFaqs('xyznonexistentterm999');
  assert.equal(results.length, 0);
});

test('Contact FAQ Filter — Case-insensitivity tests (UPPERCASE, lowercase, MixedCase)', async () => {
  const { filterFaqs } = await import('../data/contactFaqs.ts');
  const upper = filterFaqs('MOMO');
  const lower = filterFaqs('momo');
  const mixed = filterFaqs('MoMo');
  assert.equal(upper.length, lower.length);
  assert.equal(upper.length, mixed.length);
  assert.ok(upper.length > 0);

  const upperPricing = filterFaqs('PRICING');
  const lowerPricing = filterFaqs('pricing');
  assert.equal(upperPricing.length, lowerPricing.length);
  assert.ok(upperPricing.length > 0);
});


