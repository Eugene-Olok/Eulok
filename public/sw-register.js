/**
 * EULOK Service Worker Registration Script
 * Registers offline cache service worker ONLY on production HTTPS origins.
 * Actively cleans up stale service workers/caches on dev preview hosts (e.g., ais-dev-*).
 */
(function() {
  if (!('serviceWorker' in navigator)) return;

  var host = window.location.hostname || '';
  var isDevOrigin =
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host === '0.0.0.0' ||
    host.indexOf('ais-dev-') === 0;

  if (isDevOrigin) {
    navigator.serviceWorker.getRegistrations().then(function(regs) {
      for (var i = 0; i < regs.length; i++) {
        regs[i].unregister();
      }
    }).catch(function() {});

    if ('caches' in window) {
      caches.keys().then(function(keys) {
        for (var j = 0; j < keys.length; j++) {
          if (keys[j].indexOf('eulok-cache') === 0) {
            caches.delete(keys[j]);
          }
        }
      }).catch(function() {});
    }
    return;
  }

  if (window.location.protocol === 'https:') {
    window.addEventListener('load', function() {
      navigator.serviceWorker.register('/sw.js').catch(function() {});
    });
  }
})();
