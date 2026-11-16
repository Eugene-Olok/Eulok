/**
 * EULOK High-Resilience Service Worker (Production Only)
 * Bypasses Vite dev/module paths and self-cleans if invoked on a dev host.
 */

const CACHE_NAME = 'eulok-cache-v2';
const PRECACHE_URLS = [
  '/',
  '/services',
  '/ops-suite',
  '/scope-calculator',
  '/status',
  '/verification',
  '/standards',
  '/security',
  '/privacy',
  '/manifest.webmanifest',
];

function isDevHost() {
  const host = self.location.hostname || '';
  return (
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host === '0.0.0.0' ||
    host.startsWith('ais-dev-')
  );
}

function isViteDevAsset(url) {
  return (
    url.pathname.startsWith('/@vite/') ||
    url.pathname.startsWith('/@fs/') ||
    url.pathname.startsWith('/@id/') ||
    url.pathname.startsWith('/@react-refresh') ||
    url.pathname.startsWith('/src/') ||
    url.pathname.startsWith('/node_modules/') ||
    url.searchParams.has('v') ||
    url.searchParams.has('t') ||
    url.searchParams.has('import')
  );
}

self.addEventListener('install', (event) => {
  if (isDevHost()) {
    event.waitUntil(self.skipWaiting());
    return;
  }

  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  if (isDevHost()) {
    event.waitUntil(
      caches
        .keys()
        .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
        .then(() => self.registration.unregister())
    );
    return;
  }

  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  if (isDevHost()) return;

  const url = new URL(event.request.url);

  // Skip API requests, external origins, and any Vite dev module requests
  if (
    url.pathname.startsWith('/api/') ||
    url.origin !== self.location.origin ||
    isViteDevAsset(url)
  ) {
    return;
  }

  // Network-first for HTML pages with offline cache fallback
  if (event.request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(event.request);
          if (cached) return cached;
          const fallback = await caches.match('/');
          return (
            fallback ||
            new Response('Offline - EULOK is cached for low-bandwidth resilience.', {
              headers: { 'Content-Type': 'text/plain' },
            })
          );
        })
    );
    return;
  }

  // Cache-first only for hashed immutable production assets under /_astro/
  if (url.pathname.startsWith('/_astro/')) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;
        return fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.ok) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
          }
          return networkResponse;
        });
      })
    );
  }
});
