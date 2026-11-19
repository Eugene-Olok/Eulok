import fs from 'node:fs';
import path from 'node:path';

const distDir = path.resolve(process.cwd(), 'dist');

function fail(message) {
  console.error(`ERROR [verify-dist]: ${message}`);
  process.exit(1);
}

if (!fs.existsSync(distDir)) {
  fail('dist/ directory does not exist. Run the production build first.');
}

// 1. Ensure pure static build (no Node SSR bundle, no removed /status route, no leaked prompt files)
const forbiddenPaths = [
  'server',
  'status',
  'assets/aistudio',
  'api',
];

for (const rel of forbiddenPaths) {
  const full = path.join(distDir, rel);
  if (fs.existsSync(full)) {
    fail(`Forbidden build artifact found in dist/${rel}`);
  }
}

// 2. Ensure core homepage, key routes, SEO endpoints, and brand assets exist
const requiredHtmlFiles = [
  'index.html',
  'services/index.html',
  'case-studies/index.html',
  'scope-calculator/index.html',
  'ops-suite/index.html',
  'contact/index.html',
  'standards/index.html',
  '404.html',
  'sitemap.xml',
  'robots.txt',
  'manifest.webmanifest',
  '.well-known/security.txt',
  'og-image.png',
  'logo.png',
  'icon-192.png',
  'icon-512.png',
  'favicon.ico',
];

for (const rel of requiredHtmlFiles) {
  const full = path.join(distDir, rel);
  if (!fs.existsSync(full) || fs.statSync(full).size === 0) {
    fail(`Missing or empty required static artifact: dist/${rel}`);
  }
}

// 3. Verify homepage critical HTML + linked CSS transfer size stays under 180 KB
const homeHtmlPath = path.join(distDir, 'index.html');
const homeHtml = fs.readFileSync(homeHtmlPath, 'utf8');
let criticalBytes = Buffer.byteLength(homeHtml, 'utf8');

const cssMatches = [...homeHtml.matchAll(/href="(\/_astro\/[^"]+\.css)"/g)];
for (const match of cssMatches) {
  const cssRel = match[1].replace(/^\//, '');
  const cssPath = path.join(distDir, cssRel);
  if (fs.existsSync(cssPath)) {
    criticalBytes += fs.statSync(cssPath).size;
  }
}

const MAX_CRITICAL_BYTES = 180 * 1024;
if (criticalBytes > MAX_CRITICAL_BYTES) {
  fail(
    `Homepage HTML + critical CSS (${Math.round(criticalBytes / 1024)} KB) exceeds 180 KB limit.`
  );
}

// 4. Scan all built HTML and JS bundles for removed legacy / pricing / leak patterns
const forbiddenPatterns = [
  /Hello Company OS/i,
  /Zero-Budget Infrastructure/i,
  /Approximate planning budget/i,
  /UGX 2M–7\.5M/i,
  /Budget Range \(UGX or USD\)/i,
  /LiveFinOpsTrends/i,
  /Live Telemetry/i,
  /Paste_November_/i,
  /Models propose\. Deterministic systems decide\./i,
  /consumer AI platforms/i,
  /inference providers/i,
  /budget planning range/i,
  /pricing models/i,
  /Deliberate Empty State/i,
  /formal Change Order/i,
  /Product 1/i,
  /Gitleaks/i,
  /revision limits/i,
  /\bFAANG\b/i,
];

function walkFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(walkFiles(full));
    } else if (entry.name.endsWith('.html') || entry.name.endsWith('.js')) {
      files.push(full);
    }
  }
  return files;
}

for (const file of walkFiles(distDir)) {
  const content = fs.readFileSync(file, 'utf8');
  for (const pattern of forbiddenPatterns) {
    if (pattern.test(content)) {
      fail(`Forbidden pattern ${pattern} matched in ${path.relative(process.cwd(), file)}`);
    }
  }
}

console.log(
  `[verify-dist] OK: Pure static dist/ verified (${cssMatches.length} CSS stylesheets, ${Math.round(criticalBytes / 1024)} KB critical payload <= 180 KB limit).`
);
