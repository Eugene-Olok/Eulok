/**
 * EULOK Theme Initialization Script
 * Runs synchronously in head to prevent Flash of Unstyled Content (FOUC).
 */
(function() {
  try {
    var stored = localStorage.getItem('eulok_theme');
    var prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
    var theme = stored === 'light' || stored === 'dark' ? stored : (prefersLight ? 'light' : 'dark');
    document.documentElement.setAttribute('data-theme', theme);
    var metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute('content', theme === 'light' ? '#f8fafc' : '#090E17');
    }
  } catch (e) {}
})();

document.addEventListener('astro:after-swap', function() {
  try {
    var stored = localStorage.getItem('eulok_theme');
    var prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
    var theme = stored === 'light' || stored === 'dark' ? stored : (prefersLight ? 'light' : 'dark');
    document.documentElement.setAttribute('data-theme', theme);
    var metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute('content', theme === 'light' ? '#f8fafc' : '#090E17');
    }
  } catch (e) {}
});
