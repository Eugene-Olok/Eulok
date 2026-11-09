// Deploy-time analytics configuration.
// The committed default is an empty config: no key, no network traffic.
// scripts/deploy-site.sh rewrites this file with a real key only in the
// deploy environment; committed history never carries credentials.
window.__POSTHOG_CONFIG__ = {};
